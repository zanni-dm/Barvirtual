import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Para páginas: redirige a /login si no hay sesión. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

/** Para páginas de admin: redirige a /dashboard si no es admin. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

/** Para Server Actions y endpoints administrativos: lanza error si no es admin. */
export async function assertAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    throw new Error("No autorizado");
  }
  return session.user;
}