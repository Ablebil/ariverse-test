import type { Prisma } from "@/app/generated/prisma/client";
import type {
  CreateGameInput,
  GameQueryInput,
  UpdateGameInput,
} from "@/lib/validations/game.schema";
import { getPaginationArgs, getPaginationMeta } from "@/lib/pagination";
import { serializeDecimal } from "@/lib/serialize";
import { generateSlug } from "@/lib/slug";
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

type GameDetailRelations = GameRelationList & {
  screenshots: unknown;
  tags: unknown;
};

function normalizeGameCard<T extends GameRelationList>(game: T) {
  return {
    ...game,
    genres: game.genres.map((item) => item.genre.name),
    platforms: game.platforms.map((item) => item.platform.name),
  };
}

function normalizeGameDetail<T extends GameDetailRelations>(game: T) {
  const screenshots = Array.isArray(game.screenshots) ? game.screenshots : [];
  const tags = Array.isArray(game.tags) ? game.tags : [];

  return {
    ...game,
    screenshots,
    tags,
    genres: game.genres.map((item) => item.genre.name),
    platforms: game.platforms.map((item) => item.platform.name),
  };
}

function normalizeIds(ids: string[]) {
  return Array.from(new Set(ids));
}

async function ensureSlugAvailable(slug: string, excludeId?: string) {
  const exists = await gameRepository.slugExists(slug, excludeId);
  if (exists) {
    throw new GameError("Slug sudah digunakan.", 409);
  }
}

async function validateRelationIds(
  genreIds?: string[],
  platformIds?: string[]
) {
  if (genreIds && genreIds.length > 0) {
    const uniqueGenres = normalizeIds(genreIds);
    const count = await gameRepository.countGenres(uniqueGenres);
    if (count !== uniqueGenres.length) {
      throw new GameError("Genre tidak ditemukan.", 404);
    }
  }

  if (platformIds && platformIds.length > 0) {
    const uniquePlatforms = normalizeIds(platformIds);
    const count = await gameRepository.countPlatforms(uniquePlatforms);
    if (count !== uniquePlatforms.length) {
      throw new GameError("Platform tidak ditemukan.", 404);
    }
  }
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

  return serializeDecimal(normalizeGameDetail(game));
}

export async function createGame(input: CreateGameInput) {
  const slug = input.slug ?? generateSlug(input.title);
  if (!slug) {
    throw new GameError("Slug tidak valid.", 422);
  }

  await ensureSlugAvailable(slug);

  const genreIds = normalizeIds(input.genres);
  const platformIds = normalizeIds(input.platforms);

  await validateRelationIds(genreIds, platformIds);

  const game = await gameRepository.create({
    title: input.title,
    slug,
    coverImage: input.coverImage,
    screenshots: input.screenshots,
    description: input.description,
    longDescription: input.longDescription,
    developer: input.developer,
    publisher: input.publisher,
    releaseDate: new Date(input.releaseDate),
    rating: input.rating,
    price: input.price,
    tags: input.tags ?? [],
    featured: input.featured,
    genreIds,
    platformIds,
  });

  return serializeDecimal(normalizeGameDetail(game));
}

export async function updateGame(slug: string, input: UpdateGameInput) {
  const existing = await gameRepository.findBySlug(slug);
  if (!existing) {
    throw new GameError("Game tidak ditemukan.", 404);
  }

  if (input.slug && input.slug !== existing.slug) {
    await ensureSlugAvailable(input.slug, existing.id);
  }

  await validateRelationIds(input.genres, input.platforms);

  const game = await gameRepository.update(existing.id, {
    title: input.title,
    slug: input.slug,
    coverImage: input.coverImage,
    screenshots: input.screenshots,
    description: input.description,
    longDescription: input.longDescription,
    developer: input.developer,
    publisher: input.publisher,
    releaseDate: input.releaseDate ? new Date(input.releaseDate) : undefined,
    rating: input.rating,
    price: input.price,
    tags: input.tags,
    featured: input.featured,
    genreIds: input.genres ? normalizeIds(input.genres) : undefined,
    platformIds: input.platforms ? normalizeIds(input.platforms) : undefined,
  });

  return serializeDecimal(normalizeGameDetail(game));
}

export async function deleteGame(slug: string) {
  const existing = await gameRepository.findBySlug(slug);
  if (!existing) {
    throw new GameError("Game tidak ditemukan.", 404);
  }

  await gameRepository.remove(existing.id);
}
