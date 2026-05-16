import { db } from "@/lib/db";

export function findAllGenres() {
  return db.genre.findMany({ orderBy: { name: "asc" } });
}

export function findGenreById(id: string) {
  return db.genre.findUnique({ where: { id } });
}

export function findGenreByName(name: string, excludeId?: string) {
  return db.genre.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
}

export function createGenre(name: string, slug: string) {
  return db.genre.create({
    data: { name, slug },
  });
}

export function updateGenre(id: string, name: string, slug: string) {
  return db.genre.update({
    where: { id },
    data: { name, slug },
  });
}

export function deleteGenre(id: string) {
  return db.genre.delete({ where: { id } });
}

export function findAllPlatforms() {
  return db.platform.findMany({ orderBy: { name: "asc" } });
}

export function findPlatformById(id: string) {
  return db.platform.findUnique({ where: { id } });
}

export function findPlatformByName(name: string, excludeId?: string) {
  return db.platform.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
}

export function createPlatform(name: string, slug: string) {
  return db.platform.create({
    data: { name, slug },
  });
}

export function updatePlatform(id: string, name: string, slug: string) {
  return db.platform.update({
    where: { id },
    data: { name, slug },
  });
}

export function deletePlatform(id: string) {
  return db.platform.delete({ where: { id } });
}
