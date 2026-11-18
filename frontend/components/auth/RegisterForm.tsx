"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import Alert from "@/components/ui/Alert";
import SubmitButton from "@/components/ui/SubmitButton";
import TextField from "@/components/ui/TextField";
import ResendVerificationForm from "@/components/auth/ResendVerificationForm";
import { registerAction } from "@/lib/auth/actions";
import type { FieldErrors, FormState } from "@/lib/auth/form-state";
import { registerSchema } from "@/lib/validations/auth";
import { validateForm } from "@/lib/validations/client";

export default function RegisterForm() {
  const [state, formAction] = useActionState<FormState, FormData>(registerAction, {});
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const errors: FieldErrors = { ...state.fieldErrors, ...clientErrors };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const found = validateForm(registerSchema, event.currentTarget);
    if (found) {
      event.preventDefault();
      setClientErrors(found);
    } else {
      setClientErrors({});
    }
  }

  if (state.ok) {
    return (
      <div>
        <Alert variant="success">{state.message}</Alert>
        <ResendVerificationForm email={state.values?.email} />
        <p className="mt-5 text-center text-sm text-pearl">
          <Link href="/login" className="font-semibold text-snow underline underline-offset-4">
            Ir a iniciar sesión
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-5">
      {state.message && <Alert variant="error">{state.message}</Alert>}

      <TextField
        label="Nombre de usuario"
        name="username"
        placeholder="ej: barman_92"
        autoComplete="username"
        defaultValue={state.values?.username}
        error={errors.username?.[0]}
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        placeholder="tuemail@ejemplo.com"
        autoComplete="email"
        defaultValue={state.values?.email}
        error={errors.email?.[0]}
      />
      <TextField
        label="Contraseña"
        name="password"
        type="password"
        placeholder="Mínimo 8 caracteres"
        autoComplete="new-password"
        error={errors.password?.[0]}
      />
      <TextField
        label="Confirmar contraseña"
        name="confirmPassword"
        type="password"
        placeholder="Repetí tu contraseña"
        autoComplete="new-password"
        error={errors.confirmPassword?.[0]}
      />

      <SubmitButton pendingText="Creando cuenta...">Crear cuenta</SubmitButton>

      <p className="text-center text-sm text-pearl">
        ¿Ya tenés una cuenta?{" "}
        <Link href="/login" className="font-semibold text-snow underline underline-offset-4">
          Iniciá sesión
        </Link>
      </p>
    </form>
  );
}