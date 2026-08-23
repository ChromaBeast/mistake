import { NextRequest, NextResponse } from "next/server";
import { tryFetchBackend } from "@/lib/api/server-api";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // 1. Try real Go backend
    const backendResult = await tryFetchBackend("/auth/mfa/verify", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (backendResult.ok && backendResult.data) {
      const { token, refresh_token, ...clientData } = backendResult.data;
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

    if (backendResult.status === 0) {
      return NextResponse.json(
        { error: { code: "SERVICE_UNAVAILABLE", message: "Authentication service is unreachable" } },
        { status: 503 }
      );
    }

    const errorPayload = backendResult.data || {
      error: {
        code: "MFA_FAILED",
        message: "Invalid MFA verification code",
      },
    };

    return NextResponse.json(errorPayload, { status: backendResult.status });
  } catch {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to verify MFA" } },
      { status: 500 }
    );
  }
}
