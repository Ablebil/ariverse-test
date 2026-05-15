import { NextRequest } from "next/server";
import { z } from "zod";
import { genreSchema } from "@/lib/validations/catalog.schema";
import { requireAdmin } from "@/lib/middleware-utils";
import {
  CatalogError,
  deleteGenre,
  updateGenre,
} from "@/services/catalog.service";
import {
  errorResponse,
  forbiddenResponse,
  successResponse,
  unauthorizedResponse,
  zodErrorResponse,
} from "@/lib/response";

interface RouteParams {
  params: {
    id: string;
  };
}

const idSchema = z.uuid("ID tidak valid.");

function resolveId(req: NextRequest, params: RouteParams["params"]) {
  if (params?.id) return params.id;
  const segments = req.nextUrl.pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? "";
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const auth = requireAdmin(req);
  if ("error" in auth) {
    return auth.forbidden ? forbiddenResponse() : unauthorizedResponse();
  }

  const idParsed = idSchema.safeParse(resolveId(req, params));
  if (!idParsed.success) {
    return zodErrorResponse(idParsed.error);
  }

  try {
    const body = await req.json();
    const parsed = genreSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const genre = await updateGenre(idParsed.data, parsed.data);
    return successResponse(genre, "Genre berhasil diperbarui.");
  } catch (error) {
    if (error instanceof CatalogError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const auth = requireAdmin(req);
  if ("error" in auth) {
    return auth.forbidden ? forbiddenResponse() : unauthorizedResponse();
  }

  const idParsed = idSchema.safeParse(resolveId(req, params));
  if (!idParsed.success) {
    return zodErrorResponse(idParsed.error);
  }

  try {
    await deleteGenre(idParsed.data);
    return successResponse(null, "Genre berhasil dihapus.");
  } catch (error) {
    if (error instanceof CatalogError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
