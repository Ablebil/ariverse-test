import { db } from "@/lib/db";

const wishlistGameSelect = {
  game: {
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      description: true,
      developer: true,
      publisher: true,
      releaseDate: true,
      rating: true,
      price: true,
      featured: true,
      genres: {
        select: {
          genre: {
            select: { name: true },
          },
        },
      },
      platforms: {
        select: {
          platform: {
            select: { name: true },
          },
        },
      },
    },
  },
  createdAt: true,
};

export async function findByUserId(userId: string, skip: number, take: number) {
  const [wishlists, total] = await db.$transaction([
    db.wishlist.findMany({
      where: { userId },
      select: wishlistGameSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    db.wishlist.count({ where: { userId } }),
  ]);

  return { wishlists, total };
}

export function findOne(userId: string, gameId: string) {
  return db.wishlist.findUnique({
    where: { userId_gameId: { userId, gameId } },
  });
}

export function add(userId: string, gameId: string) {
  return db.wishlist.create({
    data: { userId, gameId },
  });
}

export function remove(userId: string, gameId: string) {
  return db.wishlist.delete({
    where: { userId_gameId: { userId, gameId } },
  });
}

export function findGamesByIds(gameIds: string[]) {
  return db.game.findMany({
    where: { id: { in: gameIds } },
    select: { id: true },
  });
}

export function findWishlistGameIdsByUserId(userId: string, gameIds: string[]) {
  return db.wishlist.findMany({
    where: { userId, gameId: { in: gameIds } },
    select: { gameId: true },
  });
}

export function bulkAdd(userId: string, gameIds: string[]) {
  return db.wishlist.createMany({
    data: gameIds.map((gameId) => ({ userId, gameId })),
    skipDuplicates: true,
  });
}
