import { useState, useCallback } from 'react';

const API = (import.meta as any).env?.VITE_API_URL || '/api';

export function useCreateConversation() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: {
    adminId: string;
    propertyId?: string;
    subject?: string;
  }) => {
    setIsPending(true);
    setIsSuccess(false);
    setError(null);
    try {
      const res = await fetch(`${API}/chat/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || 'Failed to start conversation');
      }
      setIsSuccess(true);
      return json?.data;
    } catch (e: any) {
      setError(e.message || 'Failed to start conversation');
      throw e;
    } finally {
      setIsPending(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsSuccess(false);
    setError(null);
  }, []);

  return { create, isPending, isSuccess, error, reset };
}

export function useConversations() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchConversations = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    fetch(`${API}/chat/conversations`, { credentials: 'include' })
      .then((r) => { if (!r.ok) throw new Error('Failed to load conversations'); return r.json(); })
      .then((json) => setData(Array.isArray(json?.data) ? json.data : []))
      .catch(() => { setIsError(true); setData([]); })
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading, isError, fetchConversations };
}
