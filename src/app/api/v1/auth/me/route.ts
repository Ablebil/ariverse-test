import { NextRequest } from "next/server";
import { AuthError, getMe } from "@/services/auth.service";
import { requireAuth } from "@/lib/middleware-utils";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from "@/lib/response";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ("error" in auth) {
    return unauthorizedResponse();
  }

  try {
    const user = await getMe(auth.user.sub);
    return successResponse(user, "User berhasil diambil.");
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
