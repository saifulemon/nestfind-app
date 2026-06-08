import { useState, useEffect, useCallback } from 'react';

const API = (import.meta as any).env?.VITE_API_URL || '/api';

export interface TourSlot {
  id: string;
  propertyId: string;
  startTime: string;
  endTime: string;
  tourType: string;
  isBooked: boolean;
}

export function useTourSlots(propertyId: string | undefined) {
  const [slots, setSlots] = useState<TourSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!propertyId) return;
    setIsLoading(true);
    setIsError(false);
    fetch(`${API}/tours/slots/${propertyId}`, { credentials: 'include' })
      .then((r) => { if (!r.ok) throw new Error('Failed to load slots'); return r.json(); })
      .then((json) => setSlots(Array.isArray(json?.data) ? json.data : []))
      .catch(() => { setIsError(true); setSlots([]); })
      .finally(() => setIsLoading(false));
  }, [propertyId]);

  return { slots, isLoading, isError };
}

export function useBookTour() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const book = useCallback(async (slotId: string, notes?: string) => {
    setIsPending(true);
    setIsSuccess(false);
    setError(null);
    try {
      const res = await fetch(`${API}/tours/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId, notes }),
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || 'Failed to book tour');
      }
      setIsSuccess(true);
      return json?.data;
    } catch (e: any) {
      setError(e.message || 'Failed to book tour');
      throw e;
    } finally {
      setIsPending(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsSuccess(false);
    setError(null);
  }, []);

  return { book, isPending, isSuccess, error, reset };
}
