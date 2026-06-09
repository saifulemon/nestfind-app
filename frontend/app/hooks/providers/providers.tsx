// @ts-nocheck
import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store, type AppDispatch } from '~/redux/store';
import { setUser, setAuthChecked } from '~/redux/features/authSlice';

const API = (import.meta as any).env?.VITE_API_URL || '/api';
let initialized = false;

function AuthInit({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (initialized) return;
    initialized = true;

    fetch(`${API}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('not authenticated');
      })
      .then((json) => {
        const user = json?.data?.user || json?.user || json?.result;
        if (user) dispatch(setUser(user));
        else dispatch(setAuthChecked());
      })
      .catch(() => {
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
