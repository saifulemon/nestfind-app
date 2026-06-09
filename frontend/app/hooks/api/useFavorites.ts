import { useState, useEffect } from 'react';
const API = (import.meta as any).env?.VITE_API_URL || '/api';

export function useFavorites() {
  const [data, setData] = useState<any>([]);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setIsError(false);
    setLoading(true);
    fetch(API + '/favorites', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setData(d?.data?.items || []))
      .catch(() => setIsError(true))
      .finally(() => setLoading(false));
  }, []);
  return { data, loading, isError };
}

export function useToggleFavorite() {
  const toggle = async (id: string) => {
    try {
      await fetch(API + '/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: id }),
        credentials: 'include',
      });
    } catch {
      // ignore
    }
  };
  return { toggle };
}

export function useAddFavorite() {
  const [isPending, setIsPending] = useState(false);
  const mutate = async (id: string) => {
    setIsPending(true);
    try {
      await fetch(API + '/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: id }),
        credentials: 'include',
      });
    } catch {
      // ignore
    } finally {
      setIsPending(false);
    }
  };
  return { mutate, isPending };
}

export function useRemoveFavorite() {
  const [isPending, setIsPending] = useState(false);
  const mutate = async (id: string) => {
    setIsPending(true);
    try {
      await fetch(API + '/favorites/' + id, { method: 'DELETE', credentials: 'include' });
    } catch {
      // ignore
    } finally {
      setIsPending(false);
    }
  };
  return { mutate, isPending };
}

export function useFavoriteList() {
  const [data, setData] = useState<any>({ items: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    fetch(API + '/favorites', { credentials: 'include' })
      .then((r) => { if (!r.ok) throw new Error('Failed to load favorites'); return r.json(); })
      .then((json) => {
        const items = json?.data?.items ?? [];
        const meta = json?.data?.meta ?? { total: items.length, page: 1, limit: 20, totalPages: 1 };
        setData({ items, meta });
      })
      .catch((e) => { setError(e); setIsError(true); })
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading, isError, error };
}
