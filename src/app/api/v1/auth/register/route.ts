import { NextRequest } from "next/server";
import { registerSchema } from "@/lib/validations/auth.schema";
import { register, AuthError } from "@/services/auth.service";
import {
  createdResponse,
  errorResponse,
  zodErrorResponse,
} from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const user = await register(parsed.data);

    return createdResponse(user, "Registrasi berhasil.");
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
