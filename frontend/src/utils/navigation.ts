import type { NavigateFunction } from 'react-router-dom';

/**
 * Navigate back if browser history exists, otherwise navigate to fallback path.
 *
 * @param navigate react-router `navigate` function from `useNavigate()`
 * @param fallbackPath path to navigate to when there's no history (e.g. '/units')
 * @param options optional object forwarded to navigate when using fallback (e.g. { state })
 */
export function navigateBackOrFallback(navigate: NavigateFunction, fallbackPath: string, options?: { state?: any }) {
  try {
    if (typeof window !== 'undefined' && window.history && window.history.length > 1) {
      // go back in history
      navigate(-1);
    } else {
      // fallback to a safe route, optionally with state
      if (options?.state !== undefined) {
        navigate(fallbackPath, { state: options.state });
      } else {
        navigate(fallbackPath);
      }
    }
  } catch (err) {
    // As a last resort, attempt direct navigation to fallback
    try {
      navigate(fallbackPath);
    } catch (e) {
      // swallow - navigation cannot be recovered here
      // eslint-disable-next-line no-console
      console.error('Navigation failed', e);
    }
  }
}

export default navigateBackOrFallback;
