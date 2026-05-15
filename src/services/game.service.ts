import type { Prisma } from "@/app/generated/prisma/client";
import type { GameQueryInput } from "@/lib/validations/game.schema";
import { getPaginationArgs, getPaginationMeta } from "@/lib/pagination";
import { serializeDecimal } from "@/lib/serialize";
import * as gameRepository from "@/repositories/game.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

const sortMap: Record<
  NonNullable<GameQueryInput["sort"]>,
  Prisma.GameOrderByWithRelationInput
> = {
  rating_desc: { rating: "desc" },
  rating_asc: { rating: "asc" },
  newest: { releaseDate: "desc" },
  oldest: { releaseDate: "asc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
};

export class GameError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

type GameRelationList = {
  genres: Array<{ genre: { name: string } }>;
  platforms: Array<{ platform: { name: string } }>;
};

function normalizeGameCard<T extends GameRelationList>(game: T) {
  return {
    ...game,
    genres: game.genres.map((item) => item.genre.name),
    platforms: game.platforms.map((item) => item.platform.name),
  };
}

export async function getGames(query: GameQueryInput) {
  const page = query.page ?? DEFAULT_PAGE;
  const limit = query.limit ?? DEFAULT_LIMIT;

  const where: Prisma.GameWhereInput = {};

  if (query.search) {
    where.title = { contains: query.search, mode: "insensitive" };
  }

  if (query.featured !== undefined) {
    where.featured = query.featured;
  }

  if (query.genres && query.genres.length > 0) {
    where.genres = {
      some: {
        genre: {
          name: {
            in: query.genres,
            mode: "insensitive",
          },
        },
      },
    };
  }

  if (query.platforms && query.platforms.length > 0) {
    where.platforms = {
      some: {
        platform: {
          name: {
            in: query.platforms,
            mode: "insensitive",
          },
        },
      },
    };
  }

  const orderBy = query.sort ? sortMap[query.sort] : sortMap.newest;
  const paginationArgs = getPaginationArgs(page, limit);

  const { games, total } = await gameRepository.findMany({
    where,
    orderBy,
    ...paginationArgs,
  });

  const normalized = games.map((game) => normalizeGameCard(game));

  return {
    games: serializeDecimal(normalized),
    pagination: getPaginationMeta(total, page, limit),
  };
}

export async function getGameBySlug(slug: string) {
  const game = await gameRepository.findBySlug(slug);
  if (!game) {
    throw new GameError("Game tidak ditemukan.", 404);
  }

  const screenshots = Array.isArray(game.screenshots) ? game.screenshots : [];
  const tags = Array.isArray(game.tags) ? game.tags : [];

  const normalized = {
    ...game,
    screenshots,
    tags,
    genres: game.genres.map((item) => item.genre.name),
    platforms: game.platforms.map((item) => item.platform.name),
  };

  return serializeDecimal(normalized);
}
