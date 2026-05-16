import { z } from "zod";

const nameSchema = z
  .string({ error: "Nama harus diisi." })
  .trim()
  .min(1, "Nama harus diisi.")
  .max(50, "Nama maksimal 50 karakter.");

export const genreSchema = z.object({
  name: nameSchema,
});

export const platformSchema = z.object({
  name: nameSchema,
});

export type GenreInput = z.infer<typeof genreSchema>;
export type PlatformInput = z.infer<typeof platformSchema>;
