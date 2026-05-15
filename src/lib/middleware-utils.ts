import { NextRequest } from "next/server";
import { verifyAccessToken, type AccessTokenPayload } from "@/lib/auth";

export function getAuthUser(req: NextRequest): AccessTokenPayload | null {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.slice(7);
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(
  req: NextRequest
): { user: AccessTokenPayload } | { error: true } {
  const user = getAuthUser(req);
  if (!user) return { error: true };
  return { user };
}

export function requireAdmin(
  req: NextRequest
): { user: AccessTokenPayload } | { error: true; forbidden: boolean } {
  const user = getAuthUser(req);
  if (!user) return { error: true, forbidden: false };
  if (user.role !== "admin") return { error: true, forbidden: true };
  return { user };
}
