import { NextRequest, NextResponse } from "next/server";
import { tryFetchBackend } from "@/lib/api/server-api";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // 1. Try real Go Backend
    const backendResult = await tryFetchBackend("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (backendResult.ok && backendResult.data) {
      const { token, refresh_token, ...clientData } = backendResult.data;
      const response = NextResponse.json({ ...clientData, is_demo: false }, { status: 200 });

      if (token) {
        response.cookies.set("auth_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 60 * 15,
        });
      }
      if (refresh_token) {
        response.cookies.set("refresh_token", refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
      }
      return response;
    }

    // Network-level failure: the backend is unreachable
    if (backendResult.status === 0) {
      return NextResponse.json(
        { error: { code: "SERVICE_UNAVAILABLE", message: "Authentication service is unreachable" } },
        { status: 503 }
      );
    }

    // Return backend error directly (e.g. 401 Invalid Credentials)
    const errorPayload = backendResult.data || {
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Invalid corporate credentials or unauthorized tenant",
      },
    };

    return NextResponse.json(errorPayload, { status: backendResult.status });
  } catch {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to reach authentication service" } },
      { status: 500 }
    );
  }
}
