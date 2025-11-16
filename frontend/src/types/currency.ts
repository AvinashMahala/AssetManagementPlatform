// Currency-related type definitions and constants
export const SUPPORTED_CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-EU' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
} as const;

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;
export type CurrencyInfo = typeof SUPPORTED_CURRENCIES[CurrencyCode];

// Default currency for the application
export const DEFAULT_CURRENCY: CurrencyCode = 'INR';

// Currency display options
export interface CurrencyDisplayOptions {
  showSymbol?: boolean;
  showCode?: boolean;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// Helper functions
export function getCurrencyInfo(code: CurrencyCode): CurrencyInfo {
  return SUPPORTED_CURRENCIES[code];
}

export function getCurrencySymbol(code: CurrencyCode): string {
  return SUPPORTED_CURRENCIES[code].symbol;
}

export function getCurrencyName(code: CurrencyCode): string {
  return SUPPORTED_CURRENCIES[code].name;
}

export function getCurrencyLocale(code: CurrencyCode): string {
  return SUPPORTED_CURRENCIES[code].locale;
}

export function isValidCurrencyCode(code: string): code is CurrencyCode {
  return code in SUPPORTED_CURRENCIES;
}

// Get all supported currency codes
export function getSupportedCurrencyCodes(): CurrencyCode[] {
  return Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[];
}

// Get currency options for dropdowns
export function getCurrencyOptions(): Array<{ value: CurrencyCode; label: string; symbol: string }> {
  return getSupportedCurrencyCodes().map(code => ({
    value: code,
    label: `${SUPPORTED_CURRENCIES[code].name} (${SUPPORTED_CURRENCIES[code].symbol})`,
    symbol: SUPPORTED_CURRENCIES[code].symbol,
  }));
}