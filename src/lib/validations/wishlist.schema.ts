import { z } from "zod";

export const addToWishlistSchema = z.object({
  gameId: z.uuid("Invalid game ID"),
});

export const mergeWishlistSchema = z.object({
  gameIds: z
    .array(z.uuid("Each game ID must be a valid UUID"))
    .nonempty("At least one game ID is required"),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;
export type MergeWishlistInput = z.infer<typeof mergeWishlistSchema>;
