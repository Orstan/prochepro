/**
 * Централізована конфігурація API
 * URL береться з environment variable NEXT_PUBLIC_API_URL
 * Fallback: https://api.prochepro.fr
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.prochepro.fr";

/**
 * Хелпер для побудови API URL
 */
export function apiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Хелпер для fetch з базовими налаштуваннями
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = apiUrl(path);
  
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Автоматично додаємо JWT token якщо є в localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('prochepro_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Для cookie-based auth
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erreur réseau" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}
