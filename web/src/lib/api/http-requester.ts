export class HttpApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpApiError";
    this.status = status;
  }
}

export function buildQuery(
  params?: Record<string, string | number | undefined | null>
): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function httpJsonRequest<T>(
  baseUrl: string,
  path: string,
  options: RequestInit = {},
  serverToken?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(serverToken ? { Authorization: `Bearer ${serverToken}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const url = path.startsWith("/api/") ? path : `${baseUrl}${path}`;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const msg =
      typeof errorData?.error === "string"
        ? errorData.error
        : errorData?.error?.message || errorData?.message || `HTTP ${res.status}: ${res.statusText}`;
    throw new HttpApiError(msg, res.status);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}
