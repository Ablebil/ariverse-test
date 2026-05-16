import { NextRequest } from "next/server";
import { z } from "zod";
import { platformSchema } from "@/lib/validations/catalog.schema";
import { requireAdmin } from "@/lib/middleware-utils";
import {
  CatalogError,
  deletePlatform,
  updatePlatform,
} from "@/services/catalog.service";
import {
  errorResponse,
  forbiddenResponse,
  successResponse,
  unauthorizedResponse,
  zodErrorResponse,
} from "@/lib/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const idSchema = z.string().uuid("ID tidak valid.");

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const auth = requireAdmin(req);
  if ("error" in auth) {
    return auth.forbidden ? forbiddenResponse() : unauthorizedResponse();
  }

  const { id } = await params;
  const idParsed = idSchema.safeParse(id);
  if (!idParsed.success) {
    return zodErrorResponse(idParsed.error);
  }

  try {
    const body = await req.json();
    const parsed = platformSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const platform = await updatePlatform(idParsed.data, parsed.data);
    return successResponse(platform, "Platform berhasil diperbarui.");
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

  const { id } = await params;
  const idParsed = idSchema.safeParse(id);
  if (!idParsed.success) {
    return zodErrorResponse(idParsed.error);
  }

  try {
    await deletePlatform(idParsed.data);
    return successResponse(null, "Platform berhasil dihapus.");
  } catch (error) {
    if (error instanceof CatalogError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
