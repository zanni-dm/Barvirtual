import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import Alert from "@/components/ui/Alert";
import { TOKEN_ERROR_MESSAGES, findUserToken } from "@/lib/auth/tokens";

export const metadata: Metadata = { title: "Nueva contraseña" };

type SearchParams = Promise<{ token?: string }>;

async function ResetContent({ searchParams }: { searchParams: SearchParams }) {
  const token = (await searchParams).token ?? "";
  const check = await findUserToken(token, "PASSWORD_RESET");

  if (check.status === "valid") return <ResetPasswordForm token={token} />;

  return (
    <div className="space-y-5">
      <Alert variant="error">{TOKEN_ERROR_MESSAGES[check.status]}</Alert>
      <Link
        href="/recuperar-password"
        className="block rounded-lg bg-snow px-4 py-3 text-center text-sm font-semibold text-midnight hover:bg-pearl"
      >
        Pedir un nuevo enlace
      </Link>
    </div>
  );
}

export default function RestablecerPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <AuthShell heading="Nueva contraseña" description="Elegí una contraseña nueva para tu cuenta.">
      <Suspense fallback={<p className="text-center text-sm text-pearl">Comprobando enlace...</p>}>
        <ResetContent searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}