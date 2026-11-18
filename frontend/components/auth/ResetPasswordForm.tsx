"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import Alert from "@/components/ui/Alert";
import SubmitButton from "@/components/ui/SubmitButton";
import TextField from "@/components/ui/TextField";
import { resetPasswordAction } from "@/lib/auth/actions";
import type { FieldErrors, FormState } from "@/lib/auth/form-state";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { validateForm } from "@/lib/validations/client";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(resetPasswordAction, {});
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const errors: FieldErrors = { ...state.fieldErrors, ...clientErrors };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const found = validateForm(resetPasswordSchema, event.currentTarget);
    if (found) {
      event.preventDefault();
      setClientErrors(found);
    } else {
      setClientErrors({});
    }
  }

  if (state.ok) {
    return (
      <div className="space-y-5">
        <Alert variant="success">{state.message}</Alert>
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
    <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-5">
      {state.message && <Alert variant="error">{state.message}</Alert>}
      <input type="hidden" name="token" value={token} />

      <TextField
        label="Nueva contraseña"
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

      <SubmitButton pendingText="Guardando...">Guardar contraseña</SubmitButton>
    </form>
  );
}