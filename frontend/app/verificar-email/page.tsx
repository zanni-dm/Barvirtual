import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import ResendVerificationForm from "@/components/auth/ResendVerificationForm";
import Alert from "@/components/ui/Alert";
import { TOKEN_ERROR_MESSAGES, verifyEmailToken } from "@/lib/auth/tokens";

export const metadata: Metadata = { title: "Verificar correo" };

type SearchParams = Promise<{ token?: string }>;

async function VerificationResult({ searchParams }: { searchParams: SearchParams }) {
  const token = (await searchParams).token ?? "";
  const result = await verifyEmailToken(token);

  if (result === "success") {
    return (
      <div className="space-y-5">
        <Alert variant="success">¡Tu correo fue verificado! Ya podés iniciar sesión.</Alert>
        <Link
          href="/login"
          className="block rounded-lg bg-snow px-4 py-3 text-center text-sm font-semibold text-midnight hover:bg-pearl"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Alert variant="error">{TOKEN_ERROR_MESSAGES[result]}</Alert>
      {result !== "used" && <ResendVerificationForm />}
      <p className="mt-5 text-center text-sm text-pearl">
        <Link href="/login" className="font-semibold text-snow underline underline-offset-4">
          Ir a iniciar sesión
        </Link>
      </p>
    </div>
  );
}

export default function VerificarEmailPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <AuthShell heading="Verificación de correo" description="Estamos confirmando tu dirección de email.">
      <Suspense fallback={<p className="text-center text-sm text-pearl">Verificando...</p>}>
        <VerificationResult searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}