export type HeroMaskSettings = {
  initialMaskPos: string
  initialMaskSize: string
  maskPos: string
  maskSize: string
}

export function getHeroMaskSettings(width: number): HeroMaskSettings {
  const isMobile = width <= 768
  const isTablet = width > 768 && width <= 1024

  if (isMobile) {
    return {
      initialMaskPos: '50% -1500vh',
      initialMaskSize: '3100% 3100%',
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
