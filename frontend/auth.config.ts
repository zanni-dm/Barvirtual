import type { NextAuthConfig } from "next-auth";

const isPath = (path: string, base: string) => path === base || path.startsWith(`${base}/`);

export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const path = nextUrl.pathname;
      const loggedIn = !!auth?.user?.id;
      const role = auth?.user?.role;

      if (isPath(path, "/admin")) {
        if (!loggedIn) return false; // redirige a /login
        if (role !== "admin") return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }
      if (isPath(path, "/dashboard")) return loggedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
        session.user.role = token.role ?? "user";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;