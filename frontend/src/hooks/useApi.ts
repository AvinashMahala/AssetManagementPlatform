import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse, AsyncState, ApiError } from '../types/api';
import { getErrorMessage } from '../types/api';

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: unknown[] = []
): AsyncState<T> & { refetch: () => void; displayError: string } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('[useApi] Executing API call...');
      const response = await apiCall();
      console.log('[useApi] Response received:', response);

      if (response.success) {
        console.log('[useApi] Success! Data:', response.data);
        setState({
          data: response.data || null,
          loading: false,
          error: null,
        });
      } else {
        console.log('[useApi] Error response:', response.error);
        setState({
          data: null,
          loading: false,
          error: response.error || { code: 'UNKNOWN_ERROR', message: 'An error occurred' },
        });
      }
    } catch (error) {
      console.error('[useApi] Exception caught:', error);
      setState({
        data: null,
        loading: false,
        error: { code: 'NETWORK_ERROR', message: error instanceof Error ? error.message : 'An unexpected error occurred' },
      });
    }
  }, [apiCall, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    refetch: execute,
    displayError: getErrorMessage(state.error),
  };
}

export function useApiMutation<TData, TVariables>(
  apiCall: (variables: TVariables) => Promise<ApiResponse<TData>>
): {
  mutate: (variables: TVariables) => Promise<ApiResponse<TData>>;
  loading: boolean;
  error: ApiError | null;
  reset: () => void;
  displayError: string;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(async (variables: TVariables): Promise<ApiResponse<TData>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall(variables);
      if (!response.success) {
        setError(response.error || { code: 'UNKNOWN_ERROR', message: 'Mutation failed' });
      }
      return response;
    } catch (err) {
      const errorObj: ApiError = { code: 'NETWORK_ERROR', message: err instanceof Error ? err.message : 'An unexpected error occurred' };
      setError(errorObj);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    mutate,
    loading,
    error,
    reset,
    displayError: getErrorMessage(error),
  };
}