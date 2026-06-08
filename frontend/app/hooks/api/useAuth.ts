import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logoutUser } from '~/redux/features/authSlice';
import type { AppDispatch } from '~/redux/store';

const API = import.meta.env.VITE_API_URL || '/api';

export function useLogin() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), credentials: 'include',
      });
      const json = await res.json();
      setData(json); return json;
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };
  return { login, data, loading, error };
}

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  const register = async (body: any) => {
    setLoading(true);
    setIsError(false);
    setError(null);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Registration failed');
      return data;
    } catch (e: any) {
      setIsError(true);
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };
  return { register, loading, isError, error };
}

export function useLogout() {
  const dispatch = useDispatch<AppDispatch>();

  const logout = async () => {
    await dispatch(logoutUser());
  };
  return { logout };
}

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const send = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }), credentials: 'include',
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.message || 'Something went wrong');
        setLoading(false);
        return;
      }
      setSent(true);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };
  return { send, loading, sent, error };
}

export function useResetPassword() {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);
  const [done, setDone] = useState(false);
  const mutate = async (body: any, options?: { onSuccess?: () => void }) => {
    setIsPending(true); setIsError(false); setError(null);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Reset failed');
      setDone(true);
      options?.onSuccess?.();
      return data;
    } catch (e) {
      setError(e);
      setIsError(true);
      throw e;
    } finally { setIsPending(false); }
  };
  return { mutate, isPending, isError, error, done };
}
