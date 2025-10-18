export const colors = {
  primary: '#E8A94D',
  primaryDark: '#D69940',
  primaryLight: '#F0BC6A',
  secondary: '#4A7C7E',
  secondaryDark: '#3A6567',
  secondaryLight: '#5A9094',
  accent: '#C85846',
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#E8A94D',
  error: '#C85846',
  info: '#4A7C7E',
  confirmed: '#4A7C7E',
  checkedOut: '#9C27B0',
  returned: '#4CAF50',
  noShow: '#C85846',
  hold: '#E8A94D',
  available: '#4CAF50',
  adopted: '#4A7C7E',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const shadows = {
  small: {
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
};
