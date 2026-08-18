import { NextRequest, NextResponse } from "next/server";
import { tryFetchBackend, getServerMock } from "@/lib/api/server-api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. If demo session token, serve from mock store immediately
  if (token === "demo-token-session") {
    const mock = getServerMock();
    const currentUser = await mock.getCurrentUser();
    return NextResponse.json({ user: currentUser }, { status: 200 });
  }

  // 2. Try real backend
  const backendResult = await tryFetchBackend("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (backendResult.ok && backendResult.data) {
    return NextResponse.json(backendResult.data, { status: 200 });
  }

  // 3. Fallback mock if backend unreachable
  if (backendResult.status === 503) {
    const mock = getServerMock();
    const currentUser = await mock.getCurrentUser();
    return NextResponse.json({ user: currentUser }, { status: 200 });
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: backendResult.status || 401 });
}
