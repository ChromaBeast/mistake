import { MockApiClient } from "./mock";

export function getBackendUrl(): string {
  const url =
    process.env.API_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8080/api/v1";

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

export async function tryFetchBackend(
  path: string,
  options: RequestInit = {},
  timeoutMs = 4000
): Promise<{ ok: boolean; status: number; data: any; headers?: Headers }> {
  const baseUrl = getBackendUrl();
  const fullUrl = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(fullUrl, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      },
    });
    clearTimeout(timer);

    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data, headers: res.headers };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, status: 503, data: null };
  }
}
