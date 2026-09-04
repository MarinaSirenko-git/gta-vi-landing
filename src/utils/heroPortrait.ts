export const HERO_PORTRAIT_WIDTH = 913
export const HERO_PORTRAIT_HEIGHT = 1826

const HERO_PORTRAIT_SRCSET_WIDTHS = [480, 640, 824, 913] as const

export const HERO_PORTRAIT_SIZES = '100vw'

function heroPortraitUrl(width: number, format: 'avif' | 'webp'): string {
  if (width === 913) {
    return `/images/hero/hero-bg-portrait.${format}`
  }
  return `/images/hero/hero-bg-portrait-${width}.${format}`
}

export function heroPortraitSrcset(format: 'avif' | 'webp'): string {
  return HERO_PORTRAIT_SRCSET_WIDTHS.map(
    (width) => `${heroPortraitUrl(width, format)} ${width}w`,
  ).join(', ')
}
