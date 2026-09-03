export type HeroMaskSettings = {
  initialMaskPos: string
  initialMaskSize: string
  maskPos: string
  maskSize: string
}

/** px-based initial mask — Android WebView/Chromium mishandles mask-position with vh */
const MOBILE_INITIAL_MASK_POS = '50% -9999px'
const MOBILE_INITIAL_MASK_SIZE = '10000px 10000px'

export function maskGsapProps(position: string, size: string) {
  return {
    maskPosition: position,
    maskSize: size,
    WebkitMaskPosition: position,
    WebkitMaskSize: size,
  }
}

export function getHeroMaskSettings(width: number): HeroMaskSettings {
  const isMobile = width <= 768
  const isTablet = width > 768 && width <= 1024

  if (isMobile) {
    return {
      initialMaskPos: MOBILE_INITIAL_MASK_POS,
      initialMaskSize: MOBILE_INITIAL_MASK_SIZE,
      maskPos: '50% 9.5rem',
      maskSize: '15rem auto',
    }
  } else if (isTablet) {
    return {
      initialMaskPos: '50% -1700vh',
      initialMaskSize: '3500% 3500%',
      maskPos: '50% 17vh',
      maskSize: '30% 30%',
    }
  } else {
    return {
      initialMaskPos: '50% 22%',
      initialMaskSize: '3500% 3500%',
      maskPos: '50% 22%',
      maskSize: '20% 20%',
    }
  }
}
