import { NextRequest } from "next/server";
import { AuthError, refresh } from "@/services/auth.service";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from "@/lib/response";

export async function POST(req: NextRequest) {
  const rawToken = req.cookies.get("refreshToken")?.value;
  if (!rawToken) {
    return unauthorizedResponse("Refresh token tidak ditemukan.");
  }

  try {
    const { accessToken, refreshToken, refreshTokenExpiresAt } =
      await refresh(rawToken);

    const response = successResponse(
      { accessToken },
      "Token berhasil diperbarui."
    );

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/v1/auth",
      expires: refreshTokenExpiresAt,
    });

    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
