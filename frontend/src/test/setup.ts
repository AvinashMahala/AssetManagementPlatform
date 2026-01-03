import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Provide a lightweight mock for navigation helper used across the app
vi.mock('@/utils/navigation', () => ({
  default: (navigate: Function, fallback = '/') => () => navigate(fallback),
  navigateBackOrFallback: (navigate: Function, fallback = '/') => () => navigate(fallback)
}))

// Polyfill localStorage for happy-dom tests
const localStore: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => (key in localStore ? localStore[key] : null),
  setItem: (key: string, value: string) => { localStore[key] = String(value); },
  removeItem: (key: string) => { delete localStore[key]; },
  clear: () => { Object.keys(localStore).forEach(k => delete localStore[k]); },
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, configurable: true });

// Prevent tests from attempting to load external Google Identity script
vi.mock('@/features/auth/hooks/useGoogleOAuth', () => ({
  useGoogleOAuth: (clientId: string) => ({
    isLoaded: true,
    error: null,
    initializeGoogleOAuth: () => {},
    renderGoogleButton: () => {},
  }),
}));