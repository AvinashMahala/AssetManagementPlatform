// UI-related constants
export const UI_BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1200,
} as const;

export const UI_SPACING = {
  XS: '0.25rem',   // 4px
  SM: '0.5rem',    // 8px
  MD: '1rem',      // 16px
  LG: '1.5rem',    // 24px
  XL: '2rem',      // 32px
  XXL: '3rem',     // 48px
} as const;

export const UI_FONT_SIZES = {
  XS: '0.75rem',   // 12px
  SM: '0.875rem',  // 14px
  MD: '1rem',      // 16px
  LG: '1.125rem',  // 18px
  XL: '1.25rem',   // 20px
  XXL: '1.5rem',   // 24px
  XXXL: '2rem',    // 32px
} as const;

export const UI_COLORS = {
  PRIMARY: '#007bff',
  SECONDARY: '#6c757d',
  SUCCESS: '#28a745',
  DANGER: '#dc3545',
  WARNING: '#ffc107',
  INFO: '#17a2b8',
  LIGHT: '#f8f9fa',
  DARK: '#343a40',
  WHITE: '#ffffff',
  GRAY_100: '#f8f9fa',
  GRAY_200: '#e9ecef',
  GRAY_300: '#dee2e6',
  GRAY_400: '#ced4da',
  GRAY_500: '#adb5bd',
  GRAY_600: '#6c757d',
  GRAY_700: '#495057',
  GRAY_800: '#343a40',
  GRAY_900: '#212529',
} as const;

export const UI_SHADOWS = {
  SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const;

export const UI_BORDER_RADIUS = {
  SM: '0.125rem',  // 2px
  MD: '0.25rem',   // 4px
  LG: '0.375rem',  // 6px
  XL: '0.5rem',    // 8px
  FULL: '9999px',  // Fully rounded
} as const;

export const UI_Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
} as const;