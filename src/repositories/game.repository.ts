import { db } from "@/lib/db";
import type { Prisma } from "@/app/generated/prisma/client";

const gameRelationsSelect = {
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
};

const gameCardSelect = {
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
  ...gameRelationsSelect,
};

const gameDetailSelect = {
  ...gameCardSelect,
  screenshots: true,
  longDescription: true,
  tags: true,
  createdAt: true,
  updatedAt: true,
};

interface FindManyParams {
  where?: Prisma.GameWhereInput;
  orderBy?: Prisma.GameOrderByWithRelationInput;
  skip?: number;
  take?: number;
}

export async function findMany({ where, orderBy, skip, take }: FindManyParams) {
  const [games, total] = await db.$transaction([
    db.game.findMany({
      where,
      orderBy,
      skip,
      take,
      select: gameCardSelect,
    }),
    db.game.count({ where }),
  ]);

  return { games, total };
}

export function findBySlug(slug: string) {
  return db.game.findUnique({
    where: { slug },
    select: gameDetailSelect,
  });
}
