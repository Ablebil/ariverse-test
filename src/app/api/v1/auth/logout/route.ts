import { NextRequest } from "next/server";
import { logout } from "@/services/auth.service";
import { successResponse } from "@/lib/response";

export async function POST(req: NextRequest) {
  const rawToken = req.cookies.get("refreshToken")?.value;

  await logout(rawToken);

  const response = successResponse(null, "Logout berhasil.");
  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/v1/auth",
    maxAge: 0,
  });

  return response;
}
