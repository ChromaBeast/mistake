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
    throw new Error(msg);
  }
  return res.json();
}
