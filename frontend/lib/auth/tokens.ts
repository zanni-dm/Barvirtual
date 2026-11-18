import { createHash, randomBytes } from "crypto";
import type { TokenType, UserToken } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const HOUR = 60 * 60 * 1000;
const TTL: Record<TokenType, number> = {
  EMAIL_VERIFICATION: 24 * HOUR,
  PASSWORD_RESET: 1 * HOUR,
};

export const TOKEN_ERROR_MESSAGES = {
  invalid: "El enlace no es válido. Pedí uno nuevo.",
  expired: "El enlace venció. Pedí uno nuevo.",
  used: "Este enlace ya fue utilizado.",
} as const;

export function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

/** Crea un token nuevo, descarta los anteriores sin usar y devuelve el valor en claro (solo para el correo). */
export async function createUserToken(userId: string, type: TokenType) {
  const raw = randomBytes(32).toString("hex");
  await prisma.$transaction([
    prisma.userToken.deleteMany({ where: { userId, type, usedAt: null } }),
    prisma.userToken.create({
      data: { userId, type, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + TTL[type]) },
    }),
  ]);
  return raw;
}

export type TokenCheck =
  | { status: "valid"; token: UserToken }
  | { status: "invalid" | "expired" | "used" };

export async function findUserToken(raw: string, type: TokenType): Promise<TokenCheck> {
  if (!/^[a-f0-9]{64}$/.test(raw)) return { status: "invalid" };
  const token = await prisma.userToken.findUnique({ where: { tokenHash: hashToken(raw) } });
  if (!token || token.type !== type) return { status: "invalid" };
  if (token.usedAt) return { status: "used" };
  if (token.expiresAt < new Date()) return { status: "expired" };
  return { status: "valid", token };
}

export async function verifyEmailToken(raw: string): Promise<"success" | "invalid" | "expired" | "used"> {
  const check = await findUserToken(raw, "EMAIL_VERIFICATION");
  if (check.status !== "valid") return check.status;

  const done = await prisma.$transaction(async (tx) => {
    const used = await tx.userToken.updateMany({
      where: { id: check.token.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    if (used.count !== 1) return false;
    await tx.user.update({ where: { id: check.token.userId }, data: { emailVerified: new Date() } });
    return true;
  });

  return done ? "success" : "used";
}