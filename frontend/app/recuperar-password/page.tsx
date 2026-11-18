import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function RecuperarPasswordPage() {
  return (
    <AuthShell
      heading="Recuperar contraseña"
      description="Ingresá tu email y te enviaremos un enlace para elegir una contraseña nueva."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}