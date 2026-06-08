import { useAppSelector } from '~/redux/store/hooks';
import type { AuthState } from '~/types/auth';

export function useAuth(): AuthState {
  const { user, isAuthenticated, authChecked, isLoading } = useAppSelector(
    (state) => state.auth ?? { user: null, isAuthenticated: false, authChecked: false, isLoading: false }
  );

  return {
    user: user ?? null,
    isAuthenticated: isAuthenticated ?? false,
    isLoading: isLoading ?? false,
    authChecked: authChecked ?? false,
    error: null,
  };
}
