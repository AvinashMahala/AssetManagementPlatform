// Lightweight BroadcastChannel helper for auth-related cross-tab messages
export type AuthBroadcastMsg =
  | { type: 'refreshed' }
  | { type: 'session-revoked'; sessionId: string }
  | { type: 'logged-out' }
  | { type: 'logout-all' };

const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('auth-refresh') : null;

export const postRefreshed = (): void => { if (bc) bc.postMessage({ type: 'refreshed' } as AuthBroadcastMsg); };
export const postSessionRevoked = (sessionId: string): void => { if (bc) bc.postMessage({ type: 'session-revoked', sessionId } as AuthBroadcastMsg); };
export const postLoggedOut = (): void => { if (bc) bc.postMessage({ type: 'logged-out' } as AuthBroadcastMsg); };
export const postLogoutAll = (): void => { if (bc) bc.postMessage({ type: 'logout-all' } as AuthBroadcastMsg); };

export const getBroadcastChannel = () => bc;
