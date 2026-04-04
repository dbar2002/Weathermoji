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
  gradientSunny: ['#FFD93D', '#FF9F43'] as const,
  gradientRainy: ['#6EC6FF', '#4A90D9'] as const,
  gradientCloudy: ['#C8D6E5', '#8395A7'] as const,
  gradientNight: ['#2E1065', '#4A1A8A'] as const,
  gradientSnow: ['#E8F0FE', '#B8C9E8'] as const,
  gradientStormy: ['#5C6B7A', '#2C3A47'] as const,
  gradientMist: ['#D5DBEA', '#AEB6C5'] as const,
} as const;

export type GradientKey = 'gradientSunny' | 'gradientRainy' | 'gradientCloudy' | 'gradientNight' | 'gradientSnow' | 'gradientStormy' | 'gradientMist';

export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const RADIUS = { sm: 12, md: 20, lg: 28, xl: 36, pill: 999 } as const;

export const SHADOWS = {
  card: { shadowColor: '#2D2250', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 6 },
  cardHover: { shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 32, elevation: 10 },
} as const;

export const FONTS = {
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
