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

export const COLORS = {
  primary: '#2E86AB',
  secondary: '#A23B72',
  accent: '#F18F01',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  inputText: '#2E86AB',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  border: '#E0E0E0'
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
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
