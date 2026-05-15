import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const optionalSlugSchema = z
  .preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    },
    z
      .string({ error: "Slug harus diisi." })
      .trim()
      .min(1, "Slug harus diisi.")
      .regex(slugRegex, "Slug harus berupa huruf kecil, angka, dan tanda -.")
  )
  .optional();

const queryStringArray = z.preprocess(
  (value) => {
    if (value === undefined || value === null) return undefined;
    const array = Array.isArray(value) ? value : [value];
    const normalized = array
      .map((item) => (typeof item === "string" ? item.trim() : item))
      .filter((item) => typeof item === "string" && item !== "");
    return normalized.length > 0 ? normalized : undefined;
  },
  z.array(z.string().min(1)).min(1).optional()
);

const queryBoolean = z.preprocess((value) => {
  if (value === undefined) return undefined;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return value;
}, z.boolean());

const queryNumber = (schema: z.ZodNumber) =>
  z.preprocess((value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed === "") return undefined;
      return Number(trimmed);
    }

    return value;
  }, schema);

const querySearch = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().min(1).optional());

export const gameQuerySchema = z.object({
  search: querySearch,
  genres: queryStringArray,
  platforms: queryStringArray,
  sort: z
    .enum([
      "rating_desc",
      "rating_asc",
      "newest",
      "oldest",
      "price_asc",
      "price_desc",
    ])
    .optional(),
  featured: queryBoolean.optional(),
  page: queryNumber(z.number().int().min(1)).optional(),
  limit: queryNumber(z.number().int().min(1).max(48)).optional(),
});

export const createGameSchema = z.object({
  title: z
    .string({ error: "Judul harus diisi." })
    .trim()
    .min(1, "Judul harus diisi.")
    .max(200, "Judul maksimal 200 karakter."),
  slug: optionalSlugSchema,
  coverImage: z
    .string({ error: "Cover image harus diisi." })
    .url("URL cover image tidak valid."),
  screenshots: z
    .array(z.url("URL screenshot tidak valid."))
    .min(3, "Minimal 3 screenshot."),
  description: z
    .string({ error: "Deskripsi harus diisi." })
    .trim()
    .min(1, "Deskripsi harus diisi."),
  longDescription: z
    .string({ error: "Deskripsi panjang harus diisi." })
    .trim()
    .min(1, "Deskripsi panjang harus diisi."),
  genres: z.array(z.uuid("Genre tidak valid.")).min(1, "Minimal 1 genre."),
  platforms: z
    .array(z.uuid("Platform tidak valid."))
    .min(1, "Minimal 1 platform."),
  developer: z
    .string({ error: "Developer harus diisi." })
    .trim()
    .min(1, "Developer harus diisi."),
  publisher: z
    .string({ error: "Publisher harus diisi." })
    .trim()
    .min(1, "Publisher harus diisi."),
  releaseDate: z
    .string({ error: "Tanggal rilis harus diisi." })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal rilis harus YYYY-MM-DD."),
  rating: z
    .number({ error: "Rating harus diisi." })
    .min(0, "Rating minimal 0.")
    .max(10, "Rating maksimal 10."),
  price: z.number().min(0, "Harga minimal 0.").optional(),
  tags: z.array(z.string().trim().min(1, "Tag tidak boleh kosong.")).optional(),
  featured: z.boolean().optional(),
});

export const updateGameSchema = createGameSchema.partial();

export type GameQueryInput = z.infer<typeof gameQuerySchema>;
export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameSchema>;
