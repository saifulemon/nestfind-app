import { useState, useEffect } from 'react';
const API = (import.meta as any).env?.VITE_API_URL || '/api';

export function useDashboardStats() { const [data,setData]=useState<any>(null); const [isError,setIsError]=useState(false); useEffect(()=>{setIsError(false); fetch(API+'/admin/dashboard',{credentials:'include',cache:'no-cache'}).then(r=>r.json()).then(j=>setData(j?.data||j)).catch(()=>setIsError(true))},[]); return {data, isLoading:!data, isError}; }
export function useAdminUsers() { const [data,setData]=useState<any>([]); const [isError,setIsError]=useState(false); useEffect(()=>{setIsError(false); fetch(API+'/admin/users',{credentials:'include',cache:'no-cache'}).then(r=>r.json()).then(j=>setData(j?.data||j)).catch(()=>setIsError(true))},[]); return {data, isError}; }
export function useAdminUserList(params?: any) { const [data,setData]=useState<any>({items:[],meta:{total:0,page:1,limit:20,totalPages:0}}); const [isError,setIsError]=useState(false); const [isLoading,setIsLoading]=useState(true); const qs = params ? '?'+new URLSearchParams(params).toString():''; useEffect(()=>{setIsError(false); setIsLoading(true); fetch(API+'/admin/users'+qs,{credentials:'include',cache:'no-cache'}).then(r=>r.json()).then(j=>setData(j?.data||j)).catch(()=>setIsError(true)).finally(()=>setIsLoading(false))},[qs]); return {data, isLoading, isError, error:null}; }
export const useUpdateUserStatus = () => {
  const [isPending, setIsPending] = useState(false);
  const mutate = async (
    { id, data }: { id: string; data: { status: string } },
    opts?: { onSuccess?: () => void; onError?: (err: Error) => void }
  ) => {
    setIsPending(true);
    try {
      const res = await fetch(`${API}/admin/users/${id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to update status');
      opts?.onSuccess?.();
    } catch (e: any) {
      opts?.onError?.(e);
    } finally { setIsPending(false); }
  };
  return { mutate, isPending };
};

export const useCreateUser = () => {
  const [isPending, setIsPending] = useState(false);
  const mutate = async (
    body: { name: string; email: string; password: string; role?: string },
    opts?: { onSuccess?: () => void; onError?: (err: Error) => void }
  ) => {
    setIsPending(true);
    try {
      const res = await fetch(`${API}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to create user');
      opts?.onSuccess?.();
      return json;
    } catch (e: any) {
      opts?.onError?.(e);
      throw e;
    } finally {
      setIsPending(false);
    }
  };
  return { mutate, isPending };
};
