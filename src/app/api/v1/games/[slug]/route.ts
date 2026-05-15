import { NextRequest } from "next/server";
import { updateGameSchema } from "@/lib/validations/game.schema";
import {
  deleteGame,
  GameError,
  getGameBySlug,
  updateGame,
} from "@/services/game.service";
import { requireAdmin } from "@/lib/middleware-utils";
import {
  errorResponse,
  forbiddenResponse,
  successResponse,
  unauthorizedResponse,
  zodErrorResponse,
} from "@/lib/response";

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const game = await getGameBySlug(params.slug);
    return successResponse(game, "Game berhasil diambil.");
  } catch (error) {
    if (error instanceof GameError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const auth = requireAdmin(req);
  if ("error" in auth) {
    return auth.forbidden ? forbiddenResponse() : unauthorizedResponse();
  }

  try {
    const body = await req.json();
    const parsed = updateGameSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const game = await updateGame(params.slug, parsed.data);
    return successResponse(game, "Game berhasil diperbarui.");
  } catch (error) {
    if (error instanceof GameError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const auth = requireAdmin(_req);
  if ("error" in auth) {
    return auth.forbidden ? forbiddenResponse() : unauthorizedResponse();
  }

  try {
    await deleteGame(params.slug);
    return successResponse(null, "Game berhasil dihapus.");
  } catch (error) {
    if (error instanceof GameError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
