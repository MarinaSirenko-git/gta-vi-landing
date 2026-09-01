#!/usr/bin/env bash
# Batch-optimize scroll-scrub MP4s for GSAP (muted, faststart, tighter GOP).
# Requires ffmpeg. Does not modify originals unless --replace is passed.
#
# Usage:
#   npm run videos:optimize
#   npm run videos:optimize -- --replace
#   CRF=26 GOP=1 bash scripts/optimize-videos.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO_DIR="${VIDEO_DIR:-$ROOT/public/videos}"
OUT_DIR="${OUT_DIR:-$VIDEO_DIR/optimized}"
BACKUP_DIR="${BACKUP_DIR:-$VIDEO_DIR/.backup}"

CRF="${CRF:-24}"
MAX_WIDTH="${MAX_WIDTH:-1920}"
GOP="${GOP:-15}"
PRESET="${PRESET:-slow}"
REPLACE=false

for arg in "$@"; do
  case "$arg" in
    --replace)
      REPLACE=true
      ;;
    -h | --help)
      cat <<EOF
Usage: $(basename "$0") [--replace]

Environment:
  VIDEO_DIR   Source directory (default: public/videos)
  OUT_DIR     Output directory (default: public/videos/optimized)
  CRF         x264 quality (default: 24, lower = better)
  MAX_WIDTH   Max video width (default: 1920)
  GOP         Keyframe interval in frames (default: 15; use 1 for every frame)
  PRESET      x264 preset (default: slow)

Without --replace, writes optimized copies to OUT_DIR.
With --replace, backs up originals to .backup/ then overwrites sources.
EOF
      exit 0
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 1
      ;;
  esac
done

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found. Install FFmpeg: brew install ffmpeg" >&2
  exit 1
fi

if ! compgen -G "$VIDEO_DIR"/*.mp4 >/dev/null; then
  echo "No MP4 files found in $VIDEO_DIR" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

echo "Optimizing scroll-scrub videos"
echo "  source:  $VIDEO_DIR"
echo "  output:  $OUT_DIR"
echo "  crf=$CRF maxWidth=$MAX_WIDTH gop=$GOP preset=$PRESET"
echo ""

for input in "$VIDEO_DIR"/*.mp4; do
  [[ -f "$input" ]] || continue

  filename="$(basename "$input")"
  output="$OUT_DIR/$filename"

  echo "→ $filename"

  ffmpeg -hide_banner -loglevel error -y -i "$input" \
    -an \
    -vf "scale='min(${MAX_WIDTH},iw)':-2" \
    -c:v libx264 -preset "$PRESET" -crf "$CRF" \
    -g "$GOP" -keyint_min "$GOP" \
    -pix_fmt yuv420p \
    -movflags +faststart \
    "$output"

  before="$(stat -f%z "$input" 2>/dev/null || stat -c%s "$input")"
  after="$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output")"
  saved=$((before - after))
  if ((before > 0)); then
    pct=$((saved * 100 / before))
    echo "  $(numfmt --to=iec-i --suffix=B "$before" 2>/dev/null || echo "${before}B") → $(numfmt --to=iec-i --suffix=B "$after" 2>/dev/null || echo "${after}B") (~${pct}% smaller)"
  fi
  echo ""
done

if [[ "$REPLACE" == true ]]; then
  mkdir -p "$BACKUP_DIR"
  echo "Replacing originals (backup in $(basename "$BACKUP_DIR")/)"

  for input in "$VIDEO_DIR"/*.mp4; do
    [[ -f "$input" ]] || continue
    filename="$(basename "$input")"
    optimized="$OUT_DIR/$filename"

    if [[ ! -f "$optimized" ]]; then
      echo "Skip replace for $filename (optimized file missing)" >&2
      continue
    fi

    cp -p "$input" "$BACKUP_DIR/$filename"
    cp -p "$optimized" "$input"
    echo "  replaced $filename"
  done
fi

echo "Done."
echo "Re-audit optimized files:"
echo "  npm run videos:audit -- public/videos/optimized"
if [[ "$REPLACE" == true ]]; then
  echo "Originals backed up to: $BACKUP_DIR"
else
  echo "Review outputs in: $OUT_DIR"
  echo "To swap after review: npm run videos:optimize:replace"
fi
