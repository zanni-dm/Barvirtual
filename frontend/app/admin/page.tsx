//  (zona solo para administradores)

import { Suspense } from "react";
import LogoutButton from "@/components/auth/LogoutButton";
import PageFallback from "@/components/ui/PageFallback";
import { requireAdmin } from "@/lib/auth/guards";

async function AdminContent() {
  const user = await requireAdmin();

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-6">
      <h1 className="font-display text-4xl tracking-[0.15em]">Panel de administración</h1>
      <p className="text-pearl">Sesión iniciada como administrador: {user.email}</p>
      <div>
        <LogoutButton />
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <AdminContent />
    </Suspense>
  );
}