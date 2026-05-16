import { NextRequest } from "next/server";
import { platformSchema } from "@/lib/validations/catalog.schema";
import { requireAdmin } from "@/lib/middleware-utils";
import {
  CatalogError,
  createPlatform,
  getPlatforms,
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
    const platforms = await getPlatforms();
    return successResponse(platforms, "Platform berhasil diambil.");
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
    const parsed = platformSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const platform = await createPlatform(parsed.data);
    return createdResponse(platform, "Platform berhasil dibuat.");
  } catch (error) {
    if (error instanceof CatalogError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
