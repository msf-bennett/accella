export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
};

export const TEXT_STYLES = {
  h1: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
  },
  h2: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
  },
  h3: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
  },
  body: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
  },
  caption: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
  },
};