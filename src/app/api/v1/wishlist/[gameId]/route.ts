import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware-utils";
import {
  addToWishlist,
  removeFromWishlist,
  WishlistError,
} from "@/services/wishlist.service";
import { addToWishlistSchema } from "@/lib/validations/wishlist.schema";
import {
  createdResponse,
  errorResponse,
  successResponse,
  unauthorizedResponse,
  zodErrorResponse,
} from "@/lib/response";

interface RouteContext {
  params: Promise<{ gameId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const auth = requireAuth(req);
  if ("error" in auth) {
    return unauthorizedResponse();
  }

  const { gameId } = await params;

  const parsed = addToWishlistSchema.safeParse({ gameId });
  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    await addToWishlist(auth.user.sub, parsed.data.gameId);
    return createdResponse(null, "Game berhasil ditambahkan ke wishlist.");
  } catch (error) {
    if (error instanceof WishlistError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const auth = requireAuth(req);
  if ("error" in auth) {
    return unauthorizedResponse();
  }

  const { gameId } = await params;

  const parsed = addToWishlistSchema.safeParse({ gameId });
  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    await removeFromWishlist(auth.user.sub, parsed.data.gameId);
    return successResponse(null, "Game berhasil dihapus dari wishlist.");
  } catch (error) {
    if (error instanceof WishlistError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
