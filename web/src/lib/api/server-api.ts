import { MockApiClient } from "./mock";

export function getBackendUrl(): string {
  const url =
    process.env.API_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://mistake-backend.onrender.com/api/v1"
      : "http://localhost:8080/api/v1");

  // Ensure /api/v1 suffix if omitted
  return url.endsWith("/api/v1") ? url : `${url.replace(/\/+$/, "")}/api/v1`;
}

// Global server-side fallback mock instance for zero-downtime evaluation resilience
let serverMockInstance: MockApiClient | null = null;

export function getServerMock(): MockApiClient {
  if (!serverMockInstance) {
    serverMockInstance = new MockApiClient();
  }
  return serverMockInstance;
}

export interface BackendRequest {
  method?: string;
  headers?: Record<string, string>;
  body?: BodyInit | null;
  /** Content-Type for the upstream request. Multipart bodies must NOT be overridden. */
  contentType?: string | null;
}

export async function tryFetchBackend(
  path: string,
  options: BackendRequest = {},
  timeoutMs = 15000
): Promise<{ ok: boolean; status: number; data: any }> {
  const baseUrl = getBackendUrl();
  const fullUrl = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = { ...(options.headers ?? {}) };
  if (options.contentType) {
    headers["Content-Type"] = options.contentType;
  } else if (!options.body || typeof options.body === "string") {
    // Default JSON only when there is no body or a plain-text body.
    if (options.body) headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  try {
    const res = await fetch(fullUrl, {
      method: options.method ?? "GET",
      headers,
      body: options.body,
      signal: controller.signal,
    });
    clearTimeout(timer);

    const text = await res.text();
    let data: any = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }
    return { ok: res.ok, status: res.status, data };
  } catch {
    clearTimeout(timer);
    // status 0 => network-level failure (unreachable, timeout, aborted)
    return { ok: false, status: 0, data: null };
  }
}
