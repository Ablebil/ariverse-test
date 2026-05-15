import { NextRequest } from "next/server";
import { GameError, getGameBySlug } from "@/services/game.service";
import { errorResponse, successResponse } from "@/lib/response";

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
