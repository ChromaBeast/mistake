import { NextRequest, NextResponse } from "next/server";
import { tryFetchBackend } from "@/lib/api/server-api";
import { handleMockProxyFallback } from "@/lib/api/mock/proxy-fallback";

export const dynamic = "force-dynamic";

async function handler(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    const resolvedParams = await context.params;
    const path = resolvedParams.path.join("/");

    let bodyText: string | undefined;
    let bodyJson: any = undefined;

    if (!["GET", "HEAD"].includes(req.method)) {
      bodyText = await req.text();
      try {
        bodyJson = bodyText ? JSON.parse(bodyText) : undefined;
      } catch {}
    }

    // 1. If demo session token, skip network and serve from mock fallback directly
    if (token === "demo-token-session") {
      const fallbackResult = await handleMockProxyFallback(req, path, bodyJson);
      return NextResponse.json(fallbackResult.data, { status: fallbackResult.status });
    }

    // 2. Query parameters
    const queryString = req.nextUrl.searchParams.toString();
    const targetPath = queryString ? `${path}?${queryString}` : path;

    // 3. Try real Go Backend
    const backendResult = await tryFetchBackend(targetPath, {
      method: req.method,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: bodyText,
    });

    if (backendResult.ok && backendResult.data !== null) {
      return NextResponse.json(backendResult.data, { status: backendResult.status });
    }

    // If backend returned a valid client error (400, 403, 404), pass it through
    if (!backendResult.ok && backendResult.status > 0 && backendResult.status < 500) {
      return NextResponse.json(backendResult.data, { status: backendResult.status });
    }

    // 4. Graceful Fallback if backend is unreachable (503 / network timeout / cold start)
    const fallbackResult = await handleMockProxyFallback(req, path, bodyJson);
    return NextResponse.json(fallbackResult.data, { status: fallbackResult.status });
  } catch (err) {
    const resolvedParams = await context.params;
    const path = resolvedParams?.path?.join("/") || "";
    const fallbackResult = await handleMockProxyFallback(req, path, {});
    return NextResponse.json(fallbackResult.data, { status: fallbackResult.status });
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
