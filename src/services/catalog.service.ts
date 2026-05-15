import { generateSlug } from "@/lib/slug";
import type {
  GenreInput,
  PlatformInput,
} from "@/lib/validations/catalog.schema";
import * as catalogRepository from "@/repositories/catalog.repository";

export class CatalogError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function getGenres() {
  return catalogRepository.findAllGenres();
}

export async function createGenre(input: GenreInput) {
  const existing = await catalogRepository.findGenreByName(input.name);
  if (existing) {
    throw new CatalogError("Nama genre sudah digunakan.", 409);
  }

  const slug = generateSlug(input.name);
  if (!slug) {
    throw new CatalogError("Slug genre tidak valid.", 422);
  }

  return catalogRepository.createGenre(input.name, slug);
}

export async function updateGenre(id: string, input: GenreInput) {
  const existing = await catalogRepository.findGenreById(id);
  if (!existing) {
    throw new CatalogError("Genre tidak ditemukan.", 404);
  }

  const duplicate = await catalogRepository.findGenreByName(input.name, id);
  if (duplicate) {
    throw new CatalogError("Nama genre sudah digunakan.", 409);
  }

  const slug = generateSlug(input.name);
  if (!slug) {
    throw new CatalogError("Slug genre tidak valid.", 422);
  }

  return catalogRepository.updateGenre(id, input.name, slug);
}

export async function deleteGenre(id: string) {
  const existing = await catalogRepository.findGenreById(id);
  if (!existing) {
    throw new CatalogError("Genre tidak ditemukan.", 404);
  }

  await catalogRepository.deleteGenre(id);
}

export async function getPlatforms() {
  return catalogRepository.findAllPlatforms();
}

export async function createPlatform(input: PlatformInput) {
  const existing = await catalogRepository.findPlatformByName(input.name);
  if (existing) {
    throw new CatalogError("Nama platform sudah digunakan.", 409);
  }

  const slug = generateSlug(input.name);
  if (!slug) {
    throw new CatalogError("Slug platform tidak valid.", 422);
  }

  return catalogRepository.createPlatform(input.name, slug);
}

export async function updatePlatform(id: string, input: PlatformInput) {
  const existing = await catalogRepository.findPlatformById(id);
  if (!existing) {
    throw new CatalogError("Platform tidak ditemukan.", 404);
  }

  const duplicate = await catalogRepository.findPlatformByName(input.name, id);
  if (duplicate) {
    throw new CatalogError("Nama platform sudah digunakan.", 409);
  }

  const slug = generateSlug(input.name);
  if (!slug) {
    throw new CatalogError("Slug platform tidak valid.", 422);
  }

  return catalogRepository.updatePlatform(id, input.name, slug);
}

export async function deletePlatform(id: string) {
  const existing = await catalogRepository.findPlatformById(id);
  if (!existing) {
    throw new CatalogError("Platform tidak ditemukan.", 404);
  }

  await catalogRepository.deletePlatform(id);
}
