import { NextRequest } from "next/server";
import { genreSchema } from "@/lib/validations/catalog.schema";
import { requireAdmin } from "@/lib/middleware-utils";
import {
  createGenre,
  CatalogError,
  getGenres,
} from "@/services/catalog.service";
import {
  createdResponse,
  errorResponse,
  forbiddenResponse,
  successResponse,
  unauthorizedResponse,
  zodErrorResponse,
} from "@/lib/response";

export async function GET() {
  try {
    const genres = await getGenres();
    return successResponse(genres, "Genre berhasil diambil.");
  } catch {
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if ("error" in auth) {
    return auth.forbidden ? forbiddenResponse() : unauthorizedResponse();
  }

  try {
    const body = await req.json();
    const parsed = genreSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const genre = await createGenre(parsed.data);
    return createdResponse(genre, "Genre berhasil dibuat.");
  } catch (error) {
    if (error instanceof CatalogError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
