import { getPaginationArgs, getPaginationMeta } from "@/lib/pagination";
import { serializeDecimal } from "@/lib/serialize";
import * as wishlistRepository from "@/repositories/wishlist.repository";
import * as gameRepository from "@/repositories/game.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

export class WishlistError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

interface WishlistQuery {
  page?: number;
  limit?: number;
}

type WishlistItem = {
  game: {
    genres: Array<{ genre: { name: string } }>;
    platforms: Array<{ platform: { name: string } }>;
    [key: string]: unknown;
  };
  createdAt: Date;
};

function normalizeWishlistItem(item: WishlistItem) {
  return {
    ...item,
    game: {
      ...item.game,
      genres: item.game.genres.map((g) => g.genre.name),
      platforms: item.game.platforms.map((p) => p.platform.name),
    },
  };
}

export async function getWishlist(userId: string, query: WishlistQuery) {
  const page = query.page ?? DEFAULT_PAGE;
  const limit = query.limit ?? DEFAULT_LIMIT;

  const { skip, take } = getPaginationArgs(page, limit);
  const { wishlists, total } = await wishlistRepository.findByUserId(
    userId,
    skip,
    take
  );

  const normalized = wishlists.map((item) =>
    normalizeWishlistItem(item as WishlistItem)
  );

  return {
    wishlist: serializeDecimal(normalized),
    pagination: getPaginationMeta(total, page, limit),
  };
}

export async function addToWishlist(userId: string, gameId: string) {
  const game = await gameRepository.findById(gameId);
  if (!game) {
    throw new WishlistError("Game tidak ditemukan.", 404);
  }

  const existing = await wishlistRepository.findOne(userId, gameId);
  if (existing) {
    throw new WishlistError("Game sudah ada di wishlist.", 409);
  }

  await wishlistRepository.add(userId, gameId);
}

export async function removeFromWishlist(userId: string, gameId: string) {
  const existing = await wishlistRepository.findOne(userId, gameId);
  if (!existing) {
    throw new WishlistError("Game tidak ditemukan di wishlist.", 404);
  }

  await wishlistRepository.remove(userId, gameId);
}

export async function mergeWishlist(userId: string, gameIds: string[]) {
  const existingGames = await wishlistRepository.findGamesByIds(gameIds);
  const validGameIds = existingGames.map((g) => g.id);

  if (validGameIds.length === 0) {
    return { merged: 0 };
  }

  const alreadyInWishlist =
    await wishlistRepository.findWishlistGameIdsByUserId(userId, validGameIds);
  const alreadyInWishlistSet = new Set(alreadyInWishlist.map((w) => w.gameId));
  const newGameIds = validGameIds.filter((id) => !alreadyInWishlistSet.has(id));

  if (newGameIds.length === 0) {
    return { merged: 0 };
  }

  await wishlistRepository.bulkAdd(userId, newGameIds);

  return { merged: newGameIds.length };
}
