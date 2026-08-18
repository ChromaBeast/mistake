import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_URL = process.env.API_URL || "http://localhost:8080/api/v1";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "Missing refresh token" }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errorResponse = NextResponse.json(data, { status: res.status });
      errorResponse.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
      errorResponse.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
      return errorResponse;
    }

    const { token, refresh_token: newRefreshToken, ...clientData } = data;
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
  } catch (err) {
    return NextResponse.json(
      { error: "Token refresh service temporarily unavailable" },
      { status: 503 }
    );
  }
}
