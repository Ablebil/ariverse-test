import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({ error: "Nama harus diisi." })
    .min(2, "Nama minimal 2 karakter.")
    .max(100, "Nama maksimal 100 karakter.")
    .trim(),
  email: z.email("Format email tidak valid.").toLowerCase().trim(),
  password: z
    .string({ error: "Password harus diisi." })
    .min(8, "Password minimal 8 karakter.")
    .max(72, "Password maksimal 72 karakter."),
});

export const loginSchema = z.object({
  email: z.email("Format email tidak valid.").toLowerCase().trim(),
  password: z.string({ error: "Password harus diisi." }).min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
