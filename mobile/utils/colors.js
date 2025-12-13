// Color constants for the Dentify mobile app
// These match the Tailwind color scheme defined in tailwind.config.js

export const COLORS = {
  primary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e',
  },
  secondary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  success: {
    500: '#10b981',
    600: '#059669',
  },
  danger: {
    500: '#ef4444',
    600: '#dc2626',
  },
  warning: {
    500: '#f59e0b',
    600: '#d97706',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

// Gradient presets for common use cases
export const GRADIENTS = {
  primary: 'from-primary-500 to-secondary-500',
  primaryLight: 'from-primary-400 to-secondary-400',
  primaryDark: 'from-primary-600 to-secondary-600',
  background: 'from-primary-50 via-secondary-50 to-primary-100',
};

// Status colors
export const STATUS_COLORS = {
  active: COLORS.success[500],
  inactive: COLORS.gray[400],
  pending: COLORS.warning[500],
  cancelled: COLORS.danger[500],
  completed: COLORS.success[600],
};

export default COLORS;
