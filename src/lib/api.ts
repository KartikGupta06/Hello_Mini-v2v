// Base API Fetch client configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const DEFAULT_TIMEOUT = 10000; // 10 seconds

export interface FetchOptions extends RequestInit {
  timeout?: number;
}

export async function fetchJson<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  const headers: Record<string, string> = {};

  // If body is not FormData or URLSearchParams, set default content type
  const isFormOrSearchParams = 
    options?.body instanceof URLSearchParams || 
    (typeof FormData !== "undefined" && options?.body instanceof FormData);

  if (!isFormOrSearchParams) {
    headers["Content-Type"] = "application/json";
  }

  // Retrieve client token
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // Merge options and headers
  const mergedHeaders = {
    ...headers,
    ...(options?.headers || {}),
  } as Record<string, string>;

  // Clean Content-Type header if it was explicitly deleted or overridden
  if (options?.headers && !("Content-Type" in options.headers) && isFormOrSearchParams) {
    delete mergedHeaders["Content-Type"];
  }

  // Timeout implementation
  const timeoutMs = options?.timeout ?? DEFAULT_TIMEOUT;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: mergedHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      // Session token expired or invalid, trigger logout redirect
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (
          window.location.pathname !== "/login" && 
          window.location.pathname !== "/register" && 
          window.location.pathname !== "/"
        ) {
          window.location.href = "/login?expired=true";
        }
      }
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message = errorBody.detail || errorBody.error || errorBody.message || `API error: ${response.status}`;
      throw new Error(message);
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: FetchOptions) => 
    fetchJson<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: any, options?: FetchOptions) => 
    fetchJson<T>(endpoint, { 
      ...options, 
      method: "POST", 
      body: body instanceof URLSearchParams || (typeof FormData !== "undefined" && body instanceof FormData) 
        ? body 
        : JSON.stringify(body) 
    }),
  put: <T>(endpoint: string, body?: any, options?: FetchOptions) => 
    fetchJson<T>(endpoint, { 
      ...options, 
      method: "PUT", 
      body: body instanceof URLSearchParams || (typeof FormData !== "undefined" && body instanceof FormData) 
        ? body 
        : JSON.stringify(body) 
    }),
  delete: <T>(endpoint: string, options?: FetchOptions) => 
    fetchJson<T>(endpoint, { ...options, method: "DELETE" }),
};
