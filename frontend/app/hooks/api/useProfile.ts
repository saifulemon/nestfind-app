import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { apiFetch } from '~/utils/apiFetch';
import { setUser } from '~/redux/features/authSlice';
import type { AppDispatch } from '~/redux/store';

export function useProfile() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);
  useEffect(() => {
    setIsLoading(true); setIsError(false); setError(null);
    apiFetch('/auth/me')
      .then(r => { if (!r.ok) throw new Error('Failed to load profile'); return r.json(); })
      .then(setData)
      .catch(e => { setError(e); setIsError(true); })
      .finally(() => setIsLoading(false));
  }, []);
  return { data, isLoading, isError, error };
}

export function useUpdateProfile() {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);
  const mutate = async (body: any, options?: { onSuccess?: () => void }) => {
    setIsPending(true); setIsError(false); setError(null);
    try {
      const res = await apiFetch('/profile', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Update failed');
      options?.onSuccess?.();
      return data;
    } catch (e) {
      setError(e);
      setIsError(true);
      throw e;
    } finally { setIsPending(false); }
  };
  return { mutate, isPending, isError, error };
}

export function useUpdateAvatar() {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);
  const dispatch = useDispatch<AppDispatch>();

  const mutate = async (file: File, options?: { onSuccess?: (data: any) => void }) => {
    setIsPending(true); setIsError(false); setError(null);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await apiFetch('/auth/avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Avatar upload failed');
      const user = data?.data || data;
      if (user) dispatch(setUser(user));
      options?.onSuccess?.(data);
      return data;
    } catch (e) {
      setError(e);
      setIsError(true);
      throw e;
    } finally { setIsPending(false); }
  };

  return { mutate, isPending, isError, error };
}
