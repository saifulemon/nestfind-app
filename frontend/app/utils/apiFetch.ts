import { resetChatNotifications } from '~/hooks/useChatNotifications';

const API = import.meta.env.VITE_API_URL || '/api';

export async function apiFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const res = await fetch(`${API}${url}`, {
    ...options,
    credentials: 'include',
  });

  if (
    res.status === 401 &&
    typeof window !== 'undefined' &&
    !window.location.pathname.startsWith('/login')
  ) {
    localStorage.removeItem('nestfind_auth');
    resetChatNotifications();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  return res;
}
