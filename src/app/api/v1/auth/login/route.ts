import { NextRequest } from "next/server";
import { loginSchema } from "@/lib/validations/auth.schema";
import { AuthError, login } from "@/services/auth.service";
import {
  errorResponse,
  successResponse,
  zodErrorResponse,
} from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const { user, accessToken, refreshToken, refreshTokenExpiresAt } =
      await login(parsed.data);

    const response = successResponse({ accessToken, user }, "Login berhasil.");

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
