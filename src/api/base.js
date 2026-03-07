const DEFAULT_API_BASE_URL = "https://bluuu.tours/api/new/";

const isDev = import.meta.env.DEV;
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || (isDev ? "/api/new/" : DEFAULT_API_BASE_URL);

export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, "");

export function apiUrl(path = "") {
  const normalizedPath = String(path).replace(/^\/+/, "");
  return normalizedPath ? `${API_BASE_URL}/${normalizedPath}` : API_BASE_URL;
}
