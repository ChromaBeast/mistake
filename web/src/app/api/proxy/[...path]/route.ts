import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_URL = process.env.API_URL || "http://localhost:8080/api/v1";

async function proxyRequest(
  req: NextRequest,
  path: string,
  token?: string,
  bodyText?: string
) {
  try {
    const url = new URL(`${API_URL}/${path}`);
    req.nextUrl.searchParams.forEach((val, key) => url.searchParams.set(key, val));

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const options: RequestInit = { method: req.method, headers };
    if (!["GET", "HEAD"].includes(req.method) && bodyText !== undefined) {
      options.body = bodyText;
    }

    const res = await fetch(url.toString(), options);
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  } catch (err) {
    return { status: 503, data: { error: "Backend service unreachable" } };
  }
}

async function handler(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    const refreshToken = req.cookies.get("refresh_token")?.value;
    const resolvedParams = await context.params;
    const path = resolvedParams.path.join("/");

    let bodyText: string | undefined;
    if (!["GET", "HEAD"].includes(req.method)) {
      bodyText = await req.text();
    }

    let { status, data } = await proxyRequest(req, path, token, bodyText);

    // If 401 Unauthorized and we have a refresh token, perform transparent auto-refresh
    if (status === 401 && refreshToken) {
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newAccessToken = refreshData.token;
          const newRefreshToken = refreshData.refresh_token;

          const retryResult = await proxyRequest(req, path, newAccessToken, bodyText);
          const response = NextResponse.json(retryResult.data, { status: retryResult.status });

          if (newAccessToken) {
            response.cookies.set("auth_token", newAccessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              path: "/",
              maxAge: 60 * 15,
            });
          }
          if (newRefreshToken) {
            response.cookies.set("refresh_token", newRefreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              path: "/",
              maxAge: 60 * 60 * 24 * 7,
            });
          }
          return response;
        }
      } catch (rErr) {
        // Fall through to original 401 response
      }
    }

    return NextResponse.json(data, { status });
  } catch (err) {
    return NextResponse.json({ error: "Internal Gateway Error" }, { status: 500 });
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
