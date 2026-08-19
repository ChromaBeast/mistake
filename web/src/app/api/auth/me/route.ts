import { NextRequest, NextResponse } from "next/server";
import { tryFetchBackend } from "@/lib/api/server-api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Query real backend
  const backendResult = await tryFetchBackend("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (backendResult.ok && backendResult.data) {
    return NextResponse.json({ ...backendResult.data, is_demo: false }, { status: 200 });
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: backendResult.status || 401 });
}
