import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware-utils";
import { getWishlist, WishlistError } from "@/services/wishlist.service";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from "@/lib/response";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ("error" in auth) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(req.url);

    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    const data = await getWishlist(auth.user.sub, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return successResponse(data, "Wishlist berhasil diambil.");
  } catch (error) {
    if (error instanceof WishlistError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Terjadi kesalahan pada server.", 500);
  }
}
