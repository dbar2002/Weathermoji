export const COLORS = {
  sunnyYellow: '#FFD93D',
  skyBlue: '#6EC6FF',
  cloudWhite: '#F4F7FF',
  rainBlue: '#4A90D9',
  stormGray: '#5C6B7A',
  nightPurple: '#2E1065',
  snowWhite: '#E8F0FE',
  hotOrange: '#FF6B35',
  background: '#FFF8EE',
  card: '#FFFFFF',
  text: '#2D2250',
  textLight: '#8B8BA3',
  accent: '#FF6B35',
  accentSecondary: '#6EC6FF',

  // 3-stop cinematic gradients for richer depth
  gradientSunny: ['#FFC84B', '#FF9A3C', '#FF7B47'] as const,
  gradientRainy: ['#5BA3D9', '#3D7CC9', '#2D5FA0'] as const,
  gradientCloudy: ['#B8C8DA', '#8A9DB5', '#6E849C'] as const,
  gradientNight: ['#0A1628', '#142440', '#1A3050'] as const,
  gradientSnow: ['#DCE8F8', '#B8CEE8', '#9AB8D8'] as const,
  gradientStormy: ['#2D3A48', '#1E2830', '#141C24'] as const,
  gradientMist: ['#C5CED8', '#A0ACB8', '#8090A0'] as const,
  // Night variants — deeper, more cinematic
  gradientCloudyNight: ['#1E2D3D', '#152030', '#0E1620'] as const,
  gradientRainyNight: ['#122848', '#0E1E38', '#081428'] as const,
  gradientSnowNight: ['#1E2838', '#162030', '#101828'] as const,
  gradientMistNight: ['#1E2530', '#161C25', '#10151C'] as const,
} as const;

export type GradientKey = 'gradientSunny' | 'gradientRainy' | 'gradientCloudy' | 'gradientNight' | 'gradientSnow' | 'gradientStormy' | 'gradientMist' | 'gradientCloudyNight' | 'gradientRainyNight' | 'gradientSnowNight' | 'gradientMistNight';

export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const RADIUS = { sm: 12, md: 20, lg: 28, xl: 36, pill: 999 } as const;

// 3D-enhanced shadows with embossed card feel
export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  cardHover: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 12,
  },
  // Inner glow for 3D glass effect
  cardGlass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

export const FONTS = {
  black: 'Nunito_800ExtraBold',
  bold: 'Nunito_800ExtraBold',
  semibold: 'Nunito_700Bold',
  medium: 'Nunito_600SemiBold',
  regular: 'Nunito_400Regular',
  boldFallback: 'System',
  regularFallback: 'System',
} as const;

export const FONT_SIZES = {
  emoji: 72, emojiLg: 96, heroTemp: 64, title: 28, subtitle: 20,
  body: 16, caption: 13, micro: 11,
} as const;
