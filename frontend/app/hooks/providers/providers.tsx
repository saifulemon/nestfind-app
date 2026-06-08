// @ts-nocheck
import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store, type AppDispatch } from '~/redux/store';
import { setUser, setAuthChecked, getRefreshToken, saveRefreshToken } from '~/redux/features/authSlice';

const API = (import.meta as any).env?.VITE_API_URL || '/api';
let initialized = false;

function AuthInit({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (initialized) return;
    initialized = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      dispatch(setAuthChecked());
      return;
    }
    fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('not authenticated');
      })
      .then((json) => {
        if (json.refreshToken) saveRefreshToken(json.refreshToken);
        const user = json?.data?.user || json?.user || json?.result;
        if (user) dispatch(setUser(user));
        else dispatch(setAuthChecked());
      })
      .catch(() => {
        localStorage.removeItem('nestfind_refresh');
        localStorage.removeItem('nestfind_auth');
        dispatch(setUser(null));
      });
  }, [dispatch]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInit>{children}</AuthInit>
    </Provider>
  );
}
