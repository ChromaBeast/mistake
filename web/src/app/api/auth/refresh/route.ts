import { NextRequest, NextResponse } from "next/server";
import { tryFetchBackend } from "@/lib/api/server-api";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "Missing refresh token" }, { status: 401 });
  }

  const backendResult = await tryFetchBackend("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (backendResult.ok && backendResult.data) {
    const { token, refresh_token: newRefreshToken, ...clientData } = backendResult.data;
    const response = NextResponse.json(clientData, { status: 200 });

    if (token) {
      response.cookies.set("auth_token", token, {
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

  const errorResponse = NextResponse.json(backendResult.data || { error: "Session expired" }, { status: backendResult.status || 401 });
  errorResponse.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
  errorResponse.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
  return errorResponse;
}
