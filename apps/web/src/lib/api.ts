const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const API_INTERNAL_URL =
  process.env.API_INTERNAL_URL ?? API_URL;
const SERVER_FETCH_TIMEOUT_MS = 5000;

function getAdminHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet<T>(path: string, options?: { cache?: RequestCache; next?: NextFetchRequestConfig }): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const signal = getServerFetchSignal();
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 30 },
    ...options,
    signal,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  const baseUrl = getApiBaseUrl();
  const signal = init?.signal ?? getServerFetchSignal();
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { Accept: "application/json" },
      ...init,
      signal,
    });
    if (!response.ok) return null;
    return response.json() as Promise<T>;
  } catch {
    return null;
  }
}

function getApiBaseUrl() {
  if (typeof window !== "undefined") return API_URL;
  return API_INTERNAL_URL || API_URL;
}

function getServerFetchSignal() {
  if (typeof window !== "undefined") return undefined;
  return AbortSignal.timeout(SERVER_FETCH_TIMEOUT_MS);
}

export async function apiPost<TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      typeof errorBody?.message === "string"
        ? errorBody.message
        : Array.isArray(errorBody?.message)
          ? errorBody.message.join("، ")
        : `API request failed: ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<TResponse>;
}

export async function apiDelete(path: string): Promise<void> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      typeof errorBody?.message === "string"
        ? errorBody.message
        : `API request failed: ${response.status}`;
    throw new Error(message);
  }
}

export { API_URL, getAdminHeaders };
