import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegistroPage() {
  return (
    <AuthShell
      heading="Crear cuenta"
      description="Registrate para entrar al Bar Virtual y descubrir nuestra carta."
    >
      <RegisterForm />
    </AuthShell>
  );
}