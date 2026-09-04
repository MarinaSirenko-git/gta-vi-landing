export const CHARACTER_IMAGE_WIDTH = 3560
export const CHARACTER_IMAGE_HEIGHT = 2003

export const CHARACTER_SRCSET_WIDTHS = [400, 800, 1280, 1920] as const

const DEFAULT_SIZES = '(min-width: 1536px) 45vw, (min-width: 768px) 60vw, 90vw'

export const CHARACTER_IMAGE_SIZES = {
  default: DEFAULT_SIZES,
  /** lucia-2: w-[80%] mobile, 2xl:w-[70%] */
  wide: '(min-width: 1536px) 35vw, (min-width: 768px) 50vw, 80vw',
  /** jason-3 / lucia-3: md:w-[60%] */
  medium: '(min-width: 1536px) 40vw, (min-width: 768px) 60vw, 90vw',
} as const

export function characterImageSrcset(basePath: string): string {
  const entries = CHARACTER_SRCSET_WIDTHS.map(
    (width) => `${basePath}-${width}.webp ${width}w`,
  )
  entries.push(`${basePath}.webp ${CHARACTER_IMAGE_WIDTH}w`)
  return entries.join(', ')
}
