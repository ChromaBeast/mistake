import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:8080/api/v1";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (token) {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => ({}));
  }

  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
  response.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
  return response;
}
