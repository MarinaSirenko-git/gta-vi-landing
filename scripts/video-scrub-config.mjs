/** Shared thresholds for GSAP scroll-scrub video assets. */
export const VIDEO_DIR = 'public/videos'

export const THRESHOLDS = {
  /** Clips longer than this are flagged (scroll-scrub works best with short loops). */
  maxDurationSec: 10,
  /** Warn when average video bitrate exceeds this (Mbps). */
  maxBitrateMbps: 12,
  /** Warn when width exceeds this (full-viewport cap). */
  maxWidth: 1920,
  /** Warn when a single file exceeds this size (MB). */
  maxSizeMB: 8,
  /** Scroll-scrub clips are muted; audio only adds weight. */
  requireNoAudio: true,
  /** Warn when the largest gap between keyframes exceeds this (seconds). */
  maxKeyframeGapSec: 1,
}

/** Defaults used by scripts/optimize-videos.sh (keep in sync). */
export const OPTIMIZE_DEFAULTS = {
  crf: 24,
  maxWidth: 1920,
  /** Keyframe interval in frames at 30 fps (~0.5 s). Use 1 for every-frame keys. */
  gop: 15,
  preset: 'slow',
}
