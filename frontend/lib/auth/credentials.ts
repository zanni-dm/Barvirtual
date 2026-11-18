import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CredentialsResult =
  | { status: "invalid" }
  | { status: "unverified" }
  | {
      status: "ok";
      user: { id: string; name: string | null; email: string; image: string | null; role: Role };
    };

let dummyHash: string | undefined;
const getDummyHash = () => (dummyHash ??= bcrypt.hashSync("contraseña-falsa-para-igualar-tiempos", 12));

export async function verifyCredentials(email: string, password: string): Promise<CredentialsResult> {
  const user = await prisma.user.findUnique({ where: { email } });

  // Siempre se compara contra un hash, exista o no el usuario, para no filtrar información por tiempos.
  const matches = await bcrypt.compare(password, user?.password ?? getDummyHash());

  if (!user || !user.password || !matches) return { status: "invalid" };
  if (!user.emailVerified) return { status: "unverified" };

  return {
    status: "ok",
    user: { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role },
  };
}