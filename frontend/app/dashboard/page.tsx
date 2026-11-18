
// (zona privada de usuarios) //

import Link from "next/link";
import { Suspense } from "react";
import LogoutButton from "@/components/auth/LogoutButton";
import PageFallback from "@/components/ui/PageFallback";
import { requireUser } from "@/lib/auth/guards";

async function DashboardContent() {
  const user = await requireUser();

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-6">
      <h1 className="font-display text-4xl tracking-[0.15em]">COCTELERÍA</h1>
      <p className="text-pearl">Hola, {user.name ?? user.email}. Ya estás dentro del Bar Virtual.</p>
      <div className="flex gap-3">
        {user.role === "admin" && (
          <Link
            href="/admin"
            className="rounded-lg bg-snow px-4 py-2 text-sm font-semibold text-midnight hover:bg-pearl"
          >
            Panel de administración
          </Link>
        )}
        <LogoutButton />
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <DashboardContent />
    </Suspense>
  );
}