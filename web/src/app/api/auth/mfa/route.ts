import { NextRequest, NextResponse } from "next/server";
import { tryFetchBackend, getServerMock } from "@/lib/api/server-api";

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

    if (!backendResult.ok && backendResult.status > 0 && backendResult.status < 500) {
      return NextResponse.json(backendResult.data, { status: backendResult.status });
    }

    // 2. Fallback mock verify
    const mock = getServerMock();
    const mockRes = await mock.verifyMfa(body);
    const response = NextResponse.json(
      { user: mockRes.user, tenant: mockRes.tenant, requires_mfa: false },
      { status: 200 }
    );

    response.cookies.set("auth_token", "demo-token-session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err) {
    const mock = getServerMock();
    const mockRes = await mock.verifyMfa({ mfa_token: "", code: "123456" });
    return NextResponse.json(mockRes, { status: 200 });
  }
}
