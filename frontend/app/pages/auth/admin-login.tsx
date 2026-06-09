// @ts-nocheck
import { useEffect } from 'react';

export default function AdminLogin() {
  useEffect(() => {
    window.location.href = '/login';
  }, []);

  return null;
}
