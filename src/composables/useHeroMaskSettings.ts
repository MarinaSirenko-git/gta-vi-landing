export type HeroMaskSettings = {
  initialMaskPos: string
  initialMaskSize: string
  maskPos: string
  maskSize: string
}

const MOBILE_INITIAL_MASK_SIZE = '3100% 3100%'

/** ~1500vh as px — avoids Android mask-position + vh bugs while keeping % mask-size */
function mobileInitialMaskPos(viewportHeight: number): string {
  const offsetPx = Math.round(viewportHeight * 15)
  return `50% -${offsetPx}px`
}

export function maskGsapProps(position: string, size: string) {
  return {
    maskPosition: position,
    maskSize: size,
    WebkitMaskPosition: position,
    WebkitMaskSize: size,
  }
}

export function getHeroMaskSettings(width: number, height: number): HeroMaskSettings {
  const isMobile = width <= 768
  const isTablet = width > 768 && width <= 1024

  if (isMobile) {
    return {
      initialMaskPos: mobileInitialMaskPos(height),
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
