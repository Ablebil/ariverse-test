import { db } from "@/lib/db";
import type { Prisma } from "@/app/generated/prisma/client";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

export function findByEmail(email: string) {
  return db.user.findUnique({ where: { email } });
}

export function findById(id: string) {
  return db.user.findUnique({ where: { id }, select: userSelect });
}

export function create(data: Prisma.UserCreateInput) {
  return db.user.create({ data, select: userSelect });
}

export function createRefreshToken(
  data: Prisma.RefreshTokenUncheckedCreateInput
) {
  return db.refreshToken.create({ data });
}

export function findRefreshToken(tokenHash: string) {
  return db.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { select: userSelect } },
  });
}

export function revokeRefreshToken(tokenHash: string) {
  return db.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  });
}
