#!/usr/bin/env node
/**
 * Audit MP4 assets in public/videos for GSAP scroll-scrub usage.
 * Requires ffprobe (FFmpeg).
 *
 * Usage:
 *   node scripts/audit-videos.mjs
 *   node scripts/audit-videos.mjs path/to/video.mp4
 */

import { execFile } from 'node:child_process'
import { access, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { OPTIMIZE_DEFAULTS, THRESHOLDS, VIDEO_DIR } from './video-scrub-config.mjs'

const execFileAsync = promisify(execFile)

const ROOT = path.resolve(import.meta.dirname, '..')

async function commandExists(command) {
  try {
    await execFileAsync('command', ['-v', command])
    return true
  } catch {
    return false
  }
}

async function ffprobeJson(file) {
  const { stdout } = await execFileAsync(
    'ffprobe',
    ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file],
    { maxBuffer: 4 * 1024 * 1024 },
  )
  return JSON.parse(stdout)
}

async function getKeyframeGaps(file) {
  try {
    const { stdout } = await execFileAsync(
      'ffprobe',
      [
        '-v',
        'quiet',
        '-select_streams',
        'v:0',
        '-show_frames',
        '-show_entries',
        'frame=key_frame,best_effort_timestamp_time',
        '-print_format',
        'json',
        file,
      ],
      { maxBuffer: 16 * 1024 * 1024 },
    )

    const payload = JSON.parse(stdout)
    const keyTimes = (payload.frames ?? [])
      .filter((frame) => frame.key_frame === 1)
      .map((frame) => Number(frame.best_effort_timestamp_time))
      .filter((value) => Number.isFinite(value))

    if (keyTimes.length < 2) {
      return { maxGapSec: keyTimes.length === 1 ? 0 : null, keyframeCount: keyTimes.length }
    }

    let maxGapSec = 0
    for (let index = 1; index < keyTimes.length; index += 1) {
      maxGapSec = Math.max(maxGapSec, keyTimes[index] - keyTimes[index - 1])
    }

    return { maxGapSec, keyframeCount: keyTimes.length }
  } catch {
    return { maxGapSec: null, keyframeCount: null }
  }
}

async function hasFastStart(file) {
  try {
    const { stderr } = await execFileAsync('ffprobe', ['-v', 'trace', '-i', file], {
      maxBuffer: 16 * 1024 * 1024,
    })

    let moovOffset = Number.POSITIVE_INFINITY
    let mdatOffset = Number.POSITIVE_INFINITY

    for (const line of stderr.split('\n')) {
      const moovMatch = line.match(/type:'moov' parent:'root' sz: \d+ (\d+)/)
      const mdatMatch = line.match(/type:'mdat' parent:'root' sz: \d+ (\d+)/)
      if (moovMatch) moovOffset = Number(moovMatch[1])
      if (mdatMatch) mdatOffset = Number(mdatMatch[1])
    }

    if (Number.isFinite(moovOffset) && Number.isFinite(mdatOffset)) {
      return moovOffset < mdatOffset
    }
  } catch {
    // fall through
  }

  return null
}

function formatMbps(bitRate) {
  if (!bitRate) return '—'
  return `${(Number(bitRate) / 1_000_000).toFixed(1)} Mbps`
}

function formatMb(bytes) {
  return `${(Number(bytes) / (1024 * 1024)).toFixed(2)} MB`
}

function parseFps(rate) {
  if (!rate || rate === '0/0') return null
  const [num, den] = rate.split('/').map(Number)
  if (!den) return null
  return num / den
}

function auditFile(meta, keyframes, fastStart) {
  const issues = []
  const warnings = []

  const videoStream = meta.streams.find((stream) => stream.codec_type === 'video')
  const audioStreams = meta.streams.filter((stream) => stream.codec_type === 'audio')
  const durationSec = Number(meta.format.duration ?? videoStream?.duration ?? 0)
  const sizeBytes = Number(meta.format.size ?? 0)
  const bitRate = Number(meta.format.bit_rate ?? videoStream?.bit_rate ?? 0)
  const width = Number(videoStream?.width ?? 0)
  const height = Number(videoStream?.height ?? 0)
  const fps = parseFps(videoStream?.avg_frame_rate ?? videoStream?.r_frame_rate)

  if (durationSec > THRESHOLDS.maxDurationSec) {
    warnings.push(`duration ${durationSec.toFixed(2)}s > ${THRESHOLDS.maxDurationSec}s`)
  }

  if (bitRate / 1_000_000 > THRESHOLDS.maxBitrateMbps) {
    issues.push(`bitrate ${formatMbps(bitRate)} > ${THRESHOLDS.maxBitrateMbps} Mbps`)
  }

  if (width > THRESHOLDS.maxWidth) {
    issues.push(`width ${width}px > ${THRESHOLDS.maxWidth}px`)
  }

  if (sizeBytes / (1024 * 1024) > THRESHOLDS.maxSizeMB) {
    warnings.push(`size ${formatMb(sizeBytes)} > ${THRESHOLDS.maxSizeMB} MB`)
  }

  if (THRESHOLDS.requireNoAudio && audioStreams.length > 0) {
    issues.push(`has ${audioStreams.length} audio track(s) (remove with -an for scrub clips)`)
  }

  if (
    keyframes.maxGapSec !== null &&
    keyframes.maxGapSec > THRESHOLDS.maxKeyframeGapSec
  ) {
    warnings.push(
      `max keyframe gap ${keyframes.maxGapSec.toFixed(2)}s > ${THRESHOLDS.maxKeyframeGapSec}s (scrub may stutter)`,
    )
  }

  if (fastStart === false) {
    issues.push('moov atom after mdat (add -movflags +faststart)')
  } else if (fastStart === null) {
    warnings.push('faststart status unknown')
  }

  if (videoStream?.codec_name !== 'h264') {
    warnings.push(`codec is ${videoStream?.codec_name ?? 'unknown'} (h264 is most compatible for <video>)`)
  }

  return {
    durationSec,
    sizeBytes,
    bitRate,
    width,
    height,
    fps,
    codec: videoStream?.codec_name ?? 'unknown',
    audioTracks: audioStreams.length,
    keyframeCount: keyframes.keyframeCount,
    maxKeyframeGapSec: keyframes.maxGapSec,
    fastStart,
    issues,
    warnings,
  }
}

async function auditOne(filePath) {
  const meta = await ffprobeJson(filePath)
  const keyframes = await getKeyframeGaps(filePath)
  const fastStart = await hasFastStart(filePath)
  return auditFile(meta, keyframes, fastStart)
}

async function listMp4Files(dir) {
  const entries = await readdir(dir)
  return entries
    .filter((name) => name.endsWith('.mp4'))
    .map((name) => path.join(dir, name))
    .sort()
}

async function collectFiles(args) {
  if (args.length > 0) {
    const files = []

    for (const arg of args) {
      const resolved = path.resolve(ROOT, arg)
      await access(resolved)
      const info = await stat(resolved)

      if (info.isDirectory()) {
        files.push(...(await listMp4Files(resolved)))
        continue
      }

      if (resolved.endsWith('.mp4')) {
        files.push(resolved)
      }
    }

    return [...new Set(files)].sort()
  }

  const dir = path.resolve(ROOT, VIDEO_DIR)
  return listMp4Files(dir)
}

async function main() {
  const args = process.argv.slice(2)

  if (!(await commandExists('ffprobe'))) {
    console.error('ffprobe not found. Install FFmpeg: brew install ffmpeg')
    process.exit(1)
  }

  const files = await collectFiles(args)
  if (files.length === 0) {
    console.error(`No MP4 files found in ${VIDEO_DIR}`)
    process.exit(1)
  }

  console.log('GSAP scroll-scrub video audit')
  console.log(`Directory: ${path.relative(ROOT, path.dirname(files[0])) || VIDEO_DIR}`)
  console.log(`Thresholds: ≤${THRESHOLDS.maxBitrateMbps} Mbps, ≤${THRESHOLDS.maxWidth}px, no audio`)
  console.log(
    `Suggested optimize defaults: crf=${OPTIMIZE_DEFAULTS.crf}, gop=${OPTIMIZE_DEFAULTS.gop}, maxWidth=${OPTIMIZE_DEFAULTS.maxWidth}`,
  )
  console.log('')

  let totalSize = 0
  let issueCount = 0
  let warningCount = 0

  for (const file of files) {
    await access(file)
    const relativePath = path.relative(ROOT, file)
    const report = await auditOne(file)

    totalSize += report.sizeBytes
    issueCount += report.issues.length
    warningCount += report.warnings.length

    const status =
      report.issues.length > 0 ? 'FAIL' : report.warnings.length > 0 ? 'WARN' : 'OK'

    console.log(`[${status}] ${relativePath}`)
    console.log(
      `  ${report.width}x${report.height} @ ${report.fps?.toFixed(0) ?? '?'} fps | ${report.durationSec.toFixed(2)}s | ${formatMb(report.sizeBytes)} | ${formatMbps(report.bitRate)} | ${report.codec}`,
    )
    console.log(
      `  audio: ${report.audioTracks} | keyframes: ${report.keyframeCount ?? '?'} | max key gap: ${report.maxKeyframeGapSec?.toFixed(2) ?? '?'}s | faststart: ${report.fastStart === null ? '?' : report.fastStart ? 'yes' : 'no'}`,
    )

    for (const issue of report.issues) {
      console.log(`  ✗ ${issue}`)
    }
    for (const warning of report.warnings) {
      console.log(`  ! ${warning}`)
    }
    console.log('')
  }

  console.log(`Total: ${formatMb(totalSize)} across ${files.length} file(s)`)
  console.log(`Issues: ${issueCount} | Warnings: ${warningCount}`)

  if (issueCount > 0 || warningCount > 0) {
    console.log('')
    console.log('Optimize with: npm run videos:optimize')
    console.log('Then re-audit:   npm run videos:audit -- public/videos/optimized')
  }

  process.exit(issueCount > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
