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

interface CreateGameData {
  title: string;
  slug: string;
  coverImage: string;
  screenshots: string[];
  description: string;
  longDescription: string;
  developer: string;
  publisher: string;
  releaseDate: Date;
  rating: number;
  price?: number;
  tags?: string[];
  featured?: boolean;
  genreIds: string[];
  platformIds: string[];
}

interface UpdateGameData {
  title?: string;
  slug?: string;
  coverImage?: string;
  screenshots?: string[];
  description?: string;
  longDescription?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: Date;
  rating?: number;
  price?: number;
  tags?: string[];
  featured?: boolean;
  genreIds?: string[];
  platformIds?: string[];
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

export function findById(id: string) {
  return db.game.findUnique({ where: { id }, select: gameDetailSelect });
}

export async function slugExists(slug: string, excludeId?: string) {
  const existing = await db.game.findFirst({
    where: {
      slug,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });

  return Boolean(existing);
}

export function countGenres(ids: string[]) {
  return db.genre.count({ where: { id: { in: ids } } });
}

export function countPlatforms(ids: string[]) {
  return db.platform.count({ where: { id: { in: ids } } });
}

export function create(data: CreateGameData) {
  return db.game.create({
    data: {
      title: data.title,
      slug: data.slug,
      coverImage: data.coverImage,
      screenshots: data.screenshots,
      description: data.description,
      longDescription: data.longDescription,
      developer: data.developer,
      publisher: data.publisher,
      releaseDate: data.releaseDate,
      rating: data.rating,
      price: data.price,
      tags: data.tags ?? [],
      featured: data.featured,
      genres: {
        create: data.genreIds.map((genreId) => ({
          genre: { connect: { id: genreId } },
        })),
      },
      platforms: {
        create: data.platformIds.map((platformId) => ({
          platform: { connect: { id: platformId } },
        })),
      },
    },
    select: gameDetailSelect,
  });
}

export function update(id: string, data: UpdateGameData) {
  const updateData: Prisma.GameUpdateInput = {
    title: data.title,
    slug: data.slug,
    coverImage: data.coverImage,
    screenshots: data.screenshots,
    description: data.description,
    longDescription: data.longDescription,
    developer: data.developer,
    publisher: data.publisher,
    releaseDate: data.releaseDate,
    rating: data.rating,
    price: data.price,
    tags: data.tags,
    featured: data.featured,
  };

  if (data.genreIds) {
    updateData.genres = {
      deleteMany: {},
      create: data.genreIds.map((genreId) => ({
        genre: { connect: { id: genreId } },
      })),
    };
  }

  if (data.platformIds) {
    updateData.platforms = {
      deleteMany: {},
      create: data.platformIds.map((platformId) => ({
        platform: { connect: { id: platformId } },
      })),
    };
  }

  return db.game.update({
    where: { id },
    data: updateData,
    select: gameDetailSelect,
  });
}

export function remove(id: string) {
  return db.game.delete({ where: { id } });
}
