// Formatting utilities
import { getCurrencyLocale, type CurrencyCode, type CurrencyDisplayOptions } from '../types/currency';

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'INR',
  options: CurrencyDisplayOptions = {}
): string {
  const {
    showSymbol = true,
    showCode = false,
    locale,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options;

  const currencyLocale = locale || getCurrencyLocale(currency);

  try {
    const formatted = new Intl.NumberFormat(currencyLocale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);

    // If we don't want to show symbol, remove it
    if (!showSymbol) {
      // This is a simplified approach - in a real app you might want more sophisticated parsing
      return formatted.replace(/[^\d.,\s-]/g, '').trim();
    }

    // If we want to show code instead of symbol, replace symbol with code
    if (showCode && !showSymbol) {
      return `${currency} ${formatted.replace(/[^\d.,\s-]/g, '').trim()}`;
    }

    return formatted;
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    console.warn(`Failed to format currency ${currency}, falling back to basic formatting`, error);
    return `${currency} ${amount.toFixed(maximumFractionDigits)}`;
  }
}

// Legacy function for backward compatibility - will be deprecated
export function formatCurrencyLegacy(amount: number, currency: string = 'USD'): string {
  return formatCurrency(amount, currency as CurrencyCode);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return formatDate(dateObj);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}