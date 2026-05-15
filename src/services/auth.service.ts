import crypto from "crypto";
import { promisify } from "util";
import type { User } from "@/app/generated/prisma/client";
import type { LoginInput, RegisterInput } from "@/lib/validations/auth.schema";
import {
  generateRefreshToken,
  getRefreshTokenExpiry,
  hashRefreshToken,
  signAccessToken,
} from "@/lib/auth";
import * as userRepository from "@/repositories/user.repository";

const scryptAsync = promisify(crypto.scrypt) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

const PASSWORD_KEY_LENGTH = 64;

export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function toPublicUser(user: User) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, PASSWORD_KEY_LENGTH);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [salt, keyHex] = stored.split(":");
  if (!salt || !keyHex) return false;

  const storedKey = Buffer.from(keyHex, "hex");
  const derivedKey = await scryptAsync(password, salt, storedKey.length);

  if (storedKey.length !== derivedKey.length) return false;
  return crypto.timingSafeEqual(storedKey, derivedKey);
}

export async function register(input: RegisterInput) {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) {
    throw new AuthError("Email sudah terdaftar.", 409);
  }

  const passwordHash = await hashPassword(input.password);
  const user = await userRepository.create({
    name: input.name,
    email: input.email,
    password: passwordHash,
  });

  return user;
}

export async function login(input: LoginInput) {
  const user = await userRepository.findByEmail(input.email);
  if (!user) {
    throw new AuthError("Email atau password salah.", 401);
  }

  const isValidPassword = await verifyPassword(input.password, user.password);
  if (!isValidPassword) {
    throw new AuthError("Email atau password salah.", 401);
  }

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const refreshTokenExpiresAt = getRefreshTokenExpiry();

  await userRepository.createRefreshToken({
    userId: user.id,
    tokenHash: refreshTokenHash,
    expiresAt: refreshTokenExpiresAt,
  });

  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken,
    refreshTokenExpiresAt,
  };
}

export async function getMe(userId: string) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AuthError("User tidak ditemukan.", 404);
  }

  return user;
}
