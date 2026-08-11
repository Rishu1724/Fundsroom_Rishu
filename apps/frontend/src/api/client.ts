import { mockRequest } from './mock';

export const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
const useMocks = String(import.meta.env.VITE_USE_MOCKS ?? 'false') === 'true';

export function getToken() {
  return localStorage.getItem('fundsroom_token');
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('fundsroom_token', token);
  } else {
    localStorage.removeItem('fundsroom_token');
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}) {
  if (useMocks) {
    return mockRequest<T>(path, options);
  }

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? 'Request failed');
  }

  return payload as T;
}