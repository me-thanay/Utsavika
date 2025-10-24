// API URL helper for development and production
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export function getApiUrl(path: string): string {
  // In development, use relative URLs (proxy handles it)
  // In production, use the full API URL from environment variable
  if (API_BASE) {
    return `${API_BASE}${path}`;
  }
  return path;
}

export async function fetchApi(path: string, options?: RequestInit) {
  const url = getApiUrl(path);
  const response = await fetch(url, options);
  return response;
}

