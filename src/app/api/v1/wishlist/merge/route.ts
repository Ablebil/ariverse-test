import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware-utils";
import { mergeWishlist, WishlistError } from "@/services/wishlist.service";
import { mergeWishlistSchema } from "@/lib/validations/wishlist.schema";
import {
  createdResponse,
  errorResponse,
  unauthorizedResponse,
  zodErrorResponse,
} from "@/lib/response";

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if ("error" in auth) {
    return unauthorizedResponse();
  }

  try {
    const body = await req.json();

    const parsed = mergeWishlistSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const result = await mergeWishlist(auth.user.sub, parsed.data.gameIds);
    return createdResponse(result, "Wishlist berhasil di-merge.");
  } catch (error) {
    if (error instanceof WishlistError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
