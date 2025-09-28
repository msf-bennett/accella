import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base Color Palette - Using your exact colors
const BASE_COLORS = {
  // Primary Brand Colors (YOUR COLORS)
  primary: '#2E86AB',
  primaryLight: '#5BA3C7',
  primaryDark: '#1F5F7F',
  primaryAlpha: 'rgba(46, 134, 171, 0.1)',
  
  // Secondary Brand Colors
  secondary: '#A23B72',
  secondaryLight: '#C45D8E',
  secondaryDark: '#7D2D56',
  secondaryAlpha: 'rgba(162, 59, 114, 0.1)',
  
  // Accent Colors
  accent: '#F18F01',
  accentLight: '#F4A534',
  accentDark: '#BE7001',
  accentAlpha: 'rgba(241, 143, 1, 0.1)',
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  background: '#F5F5F5',
  backgroundSecondary: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F9FA',
  
  // Text Colors
  text: '#212121',
  textSecondary: '#757575',
  textTertiary: '#9E9E9E',
  textDisabled: '#BDBDBD',
  textInverse: '#FFFFFF',
  inputText: '#2E86AB',
  placeholder: '#9E9E9E',
  
  // Status Colors
  success: '#4CAF50',
  successLight: '#81C784',
  successDark: '#388E3C',
  successAlpha: 'rgba(76, 175, 80, 0.1)',
  
  error: '#F44336',
  errorLight: '#E57373',
  errorDark: '#D32F2F',
  errorAlpha: 'rgba(244, 67, 54, 0.1)',
  
  warning: '#FF9800',
  warningLight: '#FFB74D',
  warningDark: '#F57C00',
  warningAlpha: 'rgba(255, 152, 0, 0.1)',
  
  info: '#2196F3',
  infoLight: '#64B5F6',
  infoDark: '#1976D2',
  infoAlpha: 'rgba(33, 150, 243, 0.1)',
  
  // Border Colors
  border: '#E0E0E0',
  borderLight: '#F5F5F5',
  borderDark: '#BDBDBD',
  borderFocus: '#2E86AB',
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  
  // Social Colors
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  instagram: '#E4405F',
  youtube: '#FF0000',
  linkedin: '#0A66C2',
  whatsapp: '#25D366',
  
  // Gradient Colors
  gradientPrimary: ['#2E86AB', '#A23B72'],
  gradientSecondary: ['#F18F01', '#FF6B6B'],
  gradientSuccess: ['#4CAF50', '#8BC34A'],
  gradientError: ['#F44336', '#FF5722'],
  gradientWarning: ['#FF9800', '#FFC107'],
  gradientInfo: ['#2196F3', '#03DAC6'],
};

// Dark Theme Colors
const DARK_COLORS = {
  ...BASE_COLORS,
  
  // Dark Theme Overrides
  background: '#121212',
  backgroundSecondary: '#1E1E1E',
  surface: '#1E1E1E',
  surfaceSecondary: '#2D2D2D',
  
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textTertiary: '#808080',
  textDisabled: '#666666',
  
  border: '#333333',
  borderLight: '#2D2D2D',
  borderDark: '#1A1A1A',
  
  overlay: 'rgba(255, 255, 255, 0.1)',
  overlayLight: 'rgba(255, 255, 255, 0.05)',
  overlayDark: 'rgba(255, 255, 255, 0.15)',
  
  // Dark gradient variations
  gradientPrimary: ['#1F5F7F', '#7D2D56'],
  gradientSecondary: ['#BE7001', '#D32F2F'],
};

// Spacing System
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  
  // Component-specific spacing
  containerPadding: 16,
  cardPadding: 16,
  buttonPadding: 12,
  inputPadding: 12,
  listItemPadding: 16,
  sectionSpacing: 24,
  
  // Responsive spacing
  responsive: {
    xs: screenWidth < 375 ? 12 : 16,
    sm: screenWidth < 375 ? 16 : 20,
    md: screenWidth < 375 ? 20 : 24,
    lg: screenWidth < 375 ? 24 : 32,
  },
};

// Border Radius System
export const BORDER_RADIUS = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 50,
  circle: 9999,
  
  // Component-specific radius
  button: 8,
  card: 12,
  input: 8,
  modal: 16,
  sheet: 20,
  pill: 50,
};

// Shadow System
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
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
  
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  
  // Component-specific shadows
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Typography System
export const FONTS = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
  
  // Custom fonts (if using custom fonts)
  primary: 'System',
  secondary: 'System',
  mono: Platform.select({
    ios: 'Courier',
    android: 'monospace',
    default: 'monospace',
  }),
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  xxxxl: 28,
  xxxxxl: 32,
  xxxxxxl: 36,
  
  // Semantic sizes
  caption: 12,
  body: 16,
  subtitle: 18,
  title: 24,
  heading: 28,
  display: 32,
  
  // Responsive sizes
  responsive: {
    heading: screenWidth < 375 ? 24 : 28,
    title: screenWidth < 375 ? 20 : 24,
    body: screenWidth < 375 ? 14 : 16,
  },
};

export const LINE_HEIGHTS = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
  xxxl: 36,
  
  // Semantic line heights
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
};

export const LETTER_SPACING = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 1.5,
};

export const TEXT_STYLES = {
  // Display styles
  display1: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxxxxxl,
    lineHeight: LINE_HEIGHTS.xxxl,
    fontWeight: 'bold',
    letterSpacing: LETTER_SPACING.tight,
  },
  
  display2: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxxxxl,
    lineHeight: LINE_HEIGHTS.xxl,
    fontWeight: 'bold',
    letterSpacing: LETTER_SPACING.tight,
  },
  
  // Heading styles
  h1: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxxxl,
    lineHeight: LINE_HEIGHTS.xl,
    fontWeight: 'bold',
    letterSpacing: LETTER_SPACING.normal,
  },
  
  h2: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxxl,
    lineHeight: LINE_HEIGHTS.lg,
    fontWeight: 'bold',
    letterSpacing: LETTER_SPACING.normal,
  },
  
  h3: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xxl,
    lineHeight: LINE_HEIGHTS.md,
    fontWeight: '600',
    letterSpacing: LETTER_SPACING.normal,
  },
  
  h4: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xl,
    lineHeight: LINE_HEIGHTS.md,
    fontWeight: '600',
    letterSpacing: LETTER_SPACING.normal,
  },
  
  h5: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.lg,
    lineHeight: LINE_HEIGHTS.sm,
    fontWeight: '600',
    letterSpacing: LETTER_SPACING.normal,
  },
  
  h6: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    lineHeight: LINE_HEIGHTS.sm,
    fontWeight: '600',
    letterSpacing: LETTER_SPACING.wide,
    textTransform: 'uppercase',
  },
  
  // Body text styles
  bodyLarge: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xl,
    lineHeight: LINE_HEIGHTS.md,
    fontWeight: 'normal',
  },
  
  body: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.lg,
    lineHeight: LINE_HEIGHTS.md,
    fontWeight: 'normal',
  },
  
  bodySmall: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    lineHeight: LINE_HEIGHTS.sm,
    fontWeight: 'normal',
  },
  
  // Label styles
  labelLarge: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    lineHeight: LINE_HEIGHTS.sm,
    fontWeight: '500',
    letterSpacing: LETTER_SPACING.wide,
  },
  
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    lineHeight: LINE_HEIGHTS.xs,
    fontWeight: '500',
    letterSpacing: LETTER_SPACING.wide,
  },
  
  labelSmall: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    lineHeight: LINE_HEIGHTS.xs,
    fontWeight: '500',
    letterSpacing: LETTER_SPACING.wider,
    textTransform: 'uppercase',
  },
  
  // Caption and utility styles
  caption: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    lineHeight: LINE_HEIGHTS.xs,
    fontWeight: 'normal',
  },
  
  overline: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    lineHeight: LINE_HEIGHTS.xs,
    fontWeight: '500',
    letterSpacing: LETTER_SPACING.widest,
    textTransform: 'uppercase',
  },
  
  // Interactive styles
  button: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    lineHeight: LINE_HEIGHTS.sm,
    fontWeight: '600',
    letterSpacing: LETTER_SPACING.wide,
  },
  
  link: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.lg,
    lineHeight: LINE_HEIGHTS.md,
    fontWeight: 'normal',
    textDecorationLine: 'underline',
  },
  
  // Special styles
  mono: {
    fontFamily: FONTS.mono,
    fontSize: FONT_SIZES.md,
    lineHeight: LINE_HEIGHTS.md,
    fontWeight: 'normal',
  },
  
  // Legacy styles for backward compatibility
  heading: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
  },
  
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
  },
  
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
  },
};

// Animation Timing
export const ANIMATIONS = {
  timing: {
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },
  
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Common animation presets
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 250,
  },
  
  slideUp: {
    from: { transform: [{ translateY: 100 }] },
    to: { transform: [{ translateY: 0 }] },
    duration: 300,
  },
  
  scale: {
    from: { transform: [{ scale: 0.9 }] },
    to: { transform: [{ scale: 1 }] },
    duration: 200,
  },
};

// Layout Constants
export const LAYOUT = {
  window: {
    width: screenWidth,
    height: screenHeight,
  },
  
  breakpoints: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
  },
  
  container: {
    maxWidth: screenWidth - (SPACING.md * 2),
    paddingHorizontal: SPACING.md,
  },
  
  header: {
    height: Platform.select({
      ios: 44,
      android: 56,
      default: 44,
    }),
  },
  
  tabBar: {
    height: Platform.select({
      ios: 49,
      android: 56,
      default: 49,
    }),
  },
  
  statusBar: {
    height: Platform.select({
      ios: 20,
      android: 24,
      default: 20,
    }),
  },
};

// Z-Index Constants
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
  loading: 1090,
};

// Theme Objects
const createTheme = (colors) => ({
  colors,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  fonts: FONTS,
  fontSizes: FONT_SIZES,
  textStyles: TEXT_STYLES,
  animations: ANIMATIONS,
  layout: LAYOUT,
  zIndex: Z_INDEX,
});

// Light Theme
export const LIGHT_THEME = createTheme(BASE_COLORS);

// Dark Theme
export const DARK_THEME = createTheme(DARK_COLORS);

// Default export (Light theme by default)
export const COLORS = BASE_COLORS;

// Theme utilities
export const getResponsiveValue = (values, breakpoint = screenWidth) => {
  if (typeof values === 'object' && !Array.isArray(values)) {
    if (breakpoint < 375) return values.xs || values.sm || values.md || values.lg || values.xl;
    if (breakpoint < 768) return values.sm || values.md || values.lg || values.xl;
    if (breakpoint < 1024) return values.md || values.lg || values.xl;
    if (breakpoint < 1280) return values.lg || values.xl;
    return values.xl || values.lg || values.md || values.sm || values.xs;
  }
  return values;
};

export const createColorWithOpacity = (color, opacity) => {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export const getContrastColor = (backgroundColor) => {
  // Simple contrast calculation
  const color = backgroundColor.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? BASE_COLORS.text : BASE_COLORS.textInverse;
};

// Component-specific theme helpers
export const createButtonTheme = (variant = 'primary', size = 'md') => {
  const variants = {
    primary: {
      backgroundColor: BASE_COLORS.primary,
      color: BASE_COLORS.textInverse,
    },
    secondary: {
      backgroundColor: BASE_COLORS.secondary,
      color: BASE_COLORS.textInverse,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: BASE_COLORS.primary,
      borderWidth: 1,
      color: BASE_COLORS.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: BASE_COLORS.primary,
    },
  };
  
  const sizes = {
    sm: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      fontSize: FONT_SIZES.sm,
    },
    md: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      fontSize: FONT_SIZES.md,
    },
    lg: {
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.md,
      fontSize: FONT_SIZES.lg,
    },
  };
  
  return {
    ...variants[variant],
    ...sizes[size],
    borderRadius: BORDER_RADIUS.button,
    ...SHADOWS.button,
  };
};

export const createCardTheme = (elevation = 'medium') => ({
  backgroundColor: BASE_COLORS.surface,
  borderRadius: BORDER_RADIUS.card,
  padding: SPACING.cardPadding,
  ...SHADOWS[elevation],
});

export const createInputTheme = (state = 'default') => {
  const states = {
    default: {
      borderColor: BASE_COLORS.border,
      backgroundColor: BASE_COLORS.surface,
    },
    focused: {
      borderColor: BASE_COLORS.borderFocus,
      backgroundColor: BASE_COLORS.surface,
    },
    error: {
      borderColor: BASE_COLORS.error,
      backgroundColor: BASE_COLORS.surface,
    },
    disabled: {
      borderColor: BASE_COLORS.borderLight,
      backgroundColor: BASE_COLORS.backgroundSecondary,
      opacity: 0.6,
    },
  };
  
  return {
    ...states[state],
    borderRadius: BORDER_RADIUS.input,
    padding: SPACING.inputPadding,
    fontSize: FONT_SIZES.md,
    color: BASE_COLORS.inputText,
  };
};

// Export everything as default
export default {
  LIGHT_THEME,
  DARK_THEME,
  COLORS: BASE_COLORS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  FONTS,
  FONT_SIZES,
  LINE_HEIGHTS,
  LETTER_SPACING,
  TEXT_STYLES,
  ANIMATIONS,
  LAYOUT,
  Z_INDEX,
  
  // Utilities
  getResponsiveValue,
  createColorWithOpacity,
  getContrastColor,
  createButtonTheme,
  createCardTheme,
  createInputTheme,
};