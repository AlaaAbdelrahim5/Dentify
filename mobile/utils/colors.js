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
  green: {
    100: '#dcfce7',
    200: '#bbf7d0',
    400: '#4ade80',
    600: '#16a34a',
    700: '#15803d',
    900: '#14532d',
  },
  blue: {
    100: '#dbeafe',
    400: '#60a5fa',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a',
  },
  yellow: {
    100: '#fef3c7',
    400: '#fbbf24',
    600: '#ca8a04',
    700: '#a16207',
    900: '#713f12',
  },
  red: {
    100: '#fee2e2',
    400: '#f87171',
    600: '#dc2626',
    700: '#b91c1c',
    900: '#7f1d1d',
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

// Status colors with dark mode support - matches client helpers.js
export const getStatusColors = (status, isDarkMode = false) => {
  const normalizedStatus = status?.toUpperCase();
  
  const statusMap = {
    'REQUESTED': {
      bg: isDarkMode ? COLORS.yellow[900] + '4D' : COLORS.yellow[100], // 4D = 30% opacity
      text: isDarkMode ? COLORS.yellow[400] : COLORS.yellow[700],
      border: isDarkMode ? COLORS.yellow[600] : COLORS.yellow[400],
    },
    'PENDING': {
      bg: isDarkMode ? COLORS.yellow[900] + '4D' : COLORS.yellow[100],
      text: isDarkMode ? COLORS.yellow[400] : COLORS.yellow[700],
      border: isDarkMode ? COLORS.yellow[600] : COLORS.yellow[400],
    },
    'IN_PROGRESS': {
      bg: isDarkMode ? COLORS.green[900] + '4D' : COLORS.green[100],
      text: isDarkMode ? COLORS.green[400] : COLORS.green[700],
      border: isDarkMode ? COLORS.green[600] : COLORS.green[400],
    },
    'COMPLETED': {
      bg: isDarkMode ? COLORS.blue[900] + '4D' : COLORS.blue[100],
      text: isDarkMode ? COLORS.blue[400] : COLORS.blue[700],
      border: isDarkMode ? COLORS.blue[600] : COLORS.blue[400],
    },
    'CANCELLED': {
      bg: isDarkMode ? COLORS.red[900] + '4D' : COLORS.red[100],
      text: isDarkMode ? COLORS.red[400] : COLORS.red[700],
      border: isDarkMode ? COLORS.red[600] : COLORS.red[400],
    },
    'SCHEDULED': {
      bg: isDarkMode ? COLORS.green[900] + '4D' : COLORS.green[100],
      text: isDarkMode ? COLORS.green[400] : COLORS.green[700],
      border: isDarkMode ? COLORS.green[600] : COLORS.green[400],
    },
    'CONFIRMED': {
      bg: isDarkMode ? COLORS.green[900] + '4D' : COLORS.green[100],
      text: isDarkMode ? COLORS.green[400] : COLORS.green[700],
      border: isDarkMode ? COLORS.green[600] : COLORS.green[400],
    },
    'ACTIVE': {
      bg: isDarkMode ? COLORS.green[900] + '4D' : COLORS.green[100],
      text: isDarkMode ? COLORS.green[400] : COLORS.green[700],
      border: isDarkMode ? COLORS.green[600] : COLORS.green[400],
    },
    'INACTIVE': {
      bg: isDarkMode ? COLORS.gray[900] + '4D' : COLORS.gray[100],
      text: isDarkMode ? COLORS.gray[400] : COLORS.gray[700],
      border: isDarkMode ? COLORS.gray[600] : COLORS.gray[400],
    },
    'DEACTIVATED': {
      bg: isDarkMode ? COLORS.gray[900] + '4D' : COLORS.gray[100],
      text: isDarkMode ? COLORS.gray[400] : COLORS.gray[700],
      border: isDarkMode ? COLORS.gray[600] : COLORS.gray[400],
    },
    'REJECTED': {
      bg: isDarkMode ? COLORS.red[900] + '4D' : COLORS.red[100],
      text: isDarkMode ? COLORS.red[400] : COLORS.red[700],
      border: isDarkMode ? COLORS.red[600] : COLORS.red[400],
    },
  };
  
  return statusMap[normalizedStatus] || statusMap['INACTIVE'];
};

// Simple status color (for backwards compatibility)
export const STATUS_COLORS = {
  active: COLORS.green[600],
  inactive: COLORS.gray[400],
  pending: COLORS.yellow[600],
  cancelled: COLORS.red[600],
  completed: COLORS.green[700],
  confirmed: COLORS.green[600],
  scheduled: COLORS.green[600],
};

// Treatment status colors
export const TREATMENT_STATUS_COLORS = {
  IN_PROGRESS: COLORS.blue[600],
  COMPLETED: COLORS.green[600],
  ON_HOLD: COLORS.yellow[600],
  CANCELLED: COLORS.red[600],
};

// Radiology status colors
export const RADIOLOGY_STATUS_COLORS = {
  Requested: COLORS.yellow[600],
  Available: COLORS.green[600],
  Not_Available: COLORS.red[600],
};

// UI Colors - frequently used throughout the app
export const UI_COLORS = {
  primary: COLORS.primary[500],      // #14b8a6
  primaryDark: COLORS.primary[600],  // #0d9488
  primaryLight: COLORS.primary[400], // #2dd4bf
  white: '#FFFFFF',
  black: '#000000',
  iconGray: COLORS.gray[500],        // #6b7280
  iconGrayLight: COLORS.gray[400],   // #9ca3af
  placeholderDark: COLORS.gray[500],
  placeholderLight: COLORS.gray[400],
  textDark: COLORS.gray[900],
  textLight: COLORS.gray[50],
};

export default COLORS;
