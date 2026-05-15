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
