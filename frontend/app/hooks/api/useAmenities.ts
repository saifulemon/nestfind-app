import { useState, useEffect } from 'react';
const API = (import.meta as any).env?.VITE_API_URL || '/api';

export function useAmenities() { const [data,setData]=useState<any>([]); const [isError,setIsError]=useState(false); useEffect(()=>{setIsError(false); fetch(API+'/amenities').then(r=>r.json()).then(setData).catch(()=>setIsError(true))},[]); return {data, isError}; }
export const useAmenityList = () => ({ data: [], isLoading: false });
