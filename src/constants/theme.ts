import { useColorScheme } from 'react-native';

/** Colores de marca tomados del logo de Flashly. El ámbar se reserva para la ventana activa. */
export const brand = {
  violet: '#7C5CFF',
  magenta: '#C24FE0',
  pink: '#FF4F8B',
  flash: '#FFC53D',
  flashInk: '#2B2000',
} as const;

export const gradient = [brand.violet, brand.magenta, brand.pink] as const;

/** Colores de sistema inspirados en las Human Interface Guidelines de Apple. */
const light = {
  background: '#F2F2F7',
  card: '#FFFFFF',
  elevated: '#FFFFFF',
  label: '#000000',
  secondary: 'rgba(60,60,67,0.6)',
  tertiary: 'rgba(60,60,67,0.3)',
  separator: 'rgba(60,60,67,0.18)',
  fill: 'rgba(120,120,128,0.12)',
  success: '#34C759',
  danger: '#FF3B30',
  tint: brand.violet as string,
  scheme: 'light' as 'light' | 'dark',
};

const dark: typeof light = {
  background: '#000000',
  card: '#1C1C1E',
  elevated: '#2C2C2E',
  label: '#FFFFFF',
  secondary: 'rgba(235,235,245,0.6)',
  tertiary: 'rgba(235,235,245,0.3)',
  separator: 'rgba(84,84,88,0.6)',
  fill: 'rgba(120,120,128,0.24)',
  success: '#30D158',
  danger: '#FF453A',
  tint: '#9D85FF',
  scheme: 'dark',
};

export type Palette = typeof light;

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  heavy: 'Inter_800ExtraBold',
} as const;

/** Escala tipográfica de iOS adaptada a Inter (Inter es más ancha que SF, por eso el tracking negativo). */
export const type = {
  largeTitle: { fontFamily: font.bold, fontSize: 34, lineHeight: 41, letterSpacing: -0.9 },
  title1: { fontFamily: font.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.7 },
  title2: { fontFamily: font.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.45 },
  title3: { fontFamily: font.semibold, fontSize: 20, lineHeight: 25, letterSpacing: -0.35 },
  headline: { fontFamily: font.semibold, fontSize: 17, lineHeight: 22, letterSpacing: -0.3 },
  body: { fontFamily: font.regular, fontSize: 17, lineHeight: 23, letterSpacing: -0.3 },
  callout: { fontFamily: font.regular, fontSize: 16, lineHeight: 21, letterSpacing: -0.2 },
  subhead: { fontFamily: font.regular, fontSize: 15, lineHeight: 20, letterSpacing: -0.15 },
  footnote: { fontFamily: font.regular, fontSize: 13, lineHeight: 18, letterSpacing: -0.05 },
  caption: { fontFamily: font.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0 },
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40 } as const;
export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;
