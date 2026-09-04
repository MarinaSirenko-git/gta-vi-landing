/** Intrinsic dimensions of the master logo asset (logo.webp). */
export const SITE_LOGO_WIDTH = 640
export const SITE_LOGO_HEIGHT = 428

export const SITE_LOGO_SRCSET_WIDTHS = [192, 240, 320, 384, 480] as const

export const SITE_LOGO_SIZES = {
  /** .entrance-logo: w-48 → md:w-60 → 2xl:w-72 → 3xl:w-80 */
  entrance:
    '(min-width: 1920px) 320px, (min-width: 1536px) 288px, (min-width: 768px) 240px, 192px',
  /** Outro: w-52 → md:w-72 */
  outro: '(min-width: 768px) 288px, 208px',
} as const

export function siteLogoSrcset(): string {
  return SITE_LOGO_SRCSET_WIDTHS.map(
    (width) => `/images/outro/logo-${width}.webp ${width}w`,
  ).join(', ')
}
