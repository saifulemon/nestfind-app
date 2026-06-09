import { useState, useEffect } from 'react';
const API = (import.meta as any).env?.VITE_API_URL || '/api';

export function useInquiries() {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch(API + '/inquiries', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setData(d?.data?.items || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);
  return { data, loading };
}

export function useSubmitInquiry(propertyId?: string) {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);
  const mutate = async (body: any, options?: { onSuccess?: () => void }) => {
    setIsPending(true);
    setIsError(false);
    setError(null);
    try {
      const r = await fetch(API + '/properties/' + propertyId + '/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.message || 'Failed to submit');
      options?.onSuccess?.();
      return data;
    } catch (e) {
      setError(e);
      setIsError(true);
      if (!options?.onSuccess) throw e;
    } finally {
      setIsPending(false);
    }
  };
  return { mutate, isPending, isError, error };
}

export function useReplyToInquiry() {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);
  const mutate = async (inquiryId: string, reply: string, options?: { onSuccess?: () => void }) => {
    setIsPending(true);
    setIsError(false);
    setError(null);
    try {
      const r = await fetch(`${API}/inquiries/${inquiryId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply }),
        credentials: 'include',
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.message || 'Failed to send reply');
      options?.onSuccess?.();
      return data;
    } catch (e: any) {
      setError(e);
      setIsError(true);
      throw e;
    } finally {
      setIsPending(false);
    }
  };
  return { mutate, isPending, isError, error };
}

export const useInquiryList = (params?: any, endpoint: string = '/inquiries') => {
  const [data, setData] = useState<any>({ items: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  useEffect(() => {
    setIsError(false);
    setError(null);
    setIsLoading(true);
    fetch(`${API}${endpoint}${qs}`, { credentials: 'include', cache: 'no-cache' })
      .then((r) => { if (!r.ok) throw new Error(`Request failed with status ${r.status}`); return r.json(); })
      .then((j) => {
        setData(j?.data || j);
      })
      .catch((e) => { setIsError(true); setError(e.message); })
      .finally(() => setIsLoading(false));
  }, [qs, endpoint, refreshKey]);
  const refetch = () => {
    setRefreshKey((k) => k + 1);
  };
  return { data, isLoading, isError, error, refetch };
};
