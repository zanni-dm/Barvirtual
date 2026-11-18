import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { verifyCredentials } from "@/lib/auth/credentials";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const limit = await rateLimit(`login-endpoint:${email}`, 10, 15 * 60 * 1000);
        if (!limit.allowed) return null;

        const result = await verifyCredentials(email, password);
        return result.status === "ok" ? result.user : null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.authTime = Date.now();
        return token;
      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true, emailVerified: true, passwordChangedAt: true },
        });
        const revoked =
          !dbUser ||
          !dbUser.emailVerified ||
          (dbUser.passwordChangedAt && dbUser.passwordChangedAt.getTime() > (token.authTime ?? 0));

        if (revoked) {
          token.id = undefined;
          token.role = undefined;
        } else {
          token.role = dbUser.role;
        }
      }
      return token;
    },
  },
});