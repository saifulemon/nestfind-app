import { useState, useEffect } from 'react';
const API = (import.meta as any).env?.VITE_API_URL || '/api';

export function useProperties(p?: any) { const [data,setData]=useState<any>(null); const [isError,setIsError]=useState(false); const qs = p ? '?'+new URLSearchParams(p).toString():''; useEffect(()=>{setIsError(false); fetch(API+'/properties'+qs,{credentials:'include',cache:'no-cache'}).then(r=>r.json()).then(j=>setData(j?.data||j)).catch(()=>setIsError(true))},[qs]); return {data, loading:!data, isError}; }
export function useProperty(id?: string) { const [data,setData]=useState<any>(null); const [isError,setIsError]=useState(false); useEffect(()=>{if(id){setIsError(false); fetch(API+'/properties/'+id,{credentials:'include',cache:'no-cache'}).then(r=>r.json()).then(j=>setData(j?.data||j)).catch(()=>setIsError(true))}},[id]); return {data, isError}; }
export function useCreateProperty() {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutate = async (
    body: any,
    opts?: { onSuccess?: (data?: any) => void; onError?: (err: Error) => void }
  ) => {
    setIsPending(true);
    setIsError(false);
    setIsSuccess(false);
    try {
      const isFormData = body instanceof FormData;
      const res = await fetch(`${API}/properties`, {
        method: 'POST',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? body : JSON.stringify(body),
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to create property');
      setIsSuccess(true);
      opts?.onSuccess?.(json);
      return json;
    } catch (e: any) {
      setIsError(true);
      opts?.onError?.(e);
      throw e;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, isError, isSuccess };
}
export function useDeleteProperty() {
  const [isPending, setIsPending] = useState(false);
  const mutate = async (id: string, opts?: { onSuccess?: () => void; onError?: (err: Error) => void }) => {
    setIsPending(true);
    try {
      const res = await fetch(`${API}/properties/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete property');
      opts?.onSuccess?.();
    } catch (e: any) {
      opts?.onError?.(e);
      throw e;
    } finally {
      setIsPending(false);
    }
  };
  return { mutate, isPending };
}
export function usePropertySearch(p: any) { const d = useProperties(p); return { data: d.data, isLoading: d.loading, isError: d.isError, error: null }; }
export function useUpdateProperty() {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);

  const mutate = async (
    args: { id: string; data: any },
    opts?: { onSuccess?: () => void; onError?: (err: Error) => void }
  ) => {
    setIsPending(true);
    setIsError(false);
    try {
      const res = await fetch(`${API}/properties/${args.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args.data),
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to update property');
      opts?.onSuccess?.();
      return json;
    } catch (e: any) {
      setIsError(true);
      opts?.onError?.(e);
      throw e;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, isError };
}
export function usePropertyDetail(id?: string) { const r = useProperty(id); return { data: r.data, isLoading: !r.data && !r.isError, isError: r.isError, error: null }; }
