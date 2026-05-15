import { NextRequest } from "next/server";
import {
  createGameSchema,
  gameQuerySchema,
} from "@/lib/validations/game.schema";
import { createGame, GameError, getGames } from "@/services/game.service";
import { requireAdmin } from "@/lib/middleware-utils";
import {
  createdResponse,
  errorResponse,
  forbiddenResponse,
  successResponse,
  unauthorizedResponse,
  zodErrorResponse,
} from "@/lib/response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const genres = searchParams.getAll("genres");
    const platforms = searchParams.getAll("platforms");

    const parsed = gameQuerySchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      genres: genres.length > 0 ? genres : undefined,
      platforms: platforms.length > 0 ? platforms : undefined,
      sort: searchParams.get("sort") ?? undefined,
      featured: searchParams.get("featured") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const data = await getGames(parsed.data);
    return successResponse(data, "Game berhasil diambil.");
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

    const parsed = createGameSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const game = await createGame(parsed.data);
    return createdResponse(game, "Game berhasil dibuat.");
  } catch (error) {
    if (error instanceof GameError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
