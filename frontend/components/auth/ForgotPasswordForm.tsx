"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import Alert from "@/components/ui/Alert";
import SubmitButton from "@/components/ui/SubmitButton";
import TextField from "@/components/ui/TextField";
import { forgotPasswordAction } from "@/lib/auth/actions";
import type { FieldErrors, FormState } from "@/lib/auth/form-state";
import { emailOnlySchema } from "@/lib/validations/auth";
import { validateForm } from "@/lib/validations/client";

export default function ForgotPasswordForm() {
  const [state, formAction] = useActionState<FormState, FormData>(forgotPasswordAction, {});
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const errors: FieldErrors = { ...state.fieldErrors, ...clientErrors };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const found = validateForm(emailOnlySchema, event.currentTarget);
    if (found) {
      event.preventDefault();
      setClientErrors(found);
    } else {
      setClientErrors({});
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-5">
      {state.message && <Alert variant={state.ok ? "success" : "error"}>{state.message}</Alert>}

      <TextField
        label="Email"
        name="email"
        type="email"
        placeholder="tuemail@ejemplo.com"
        autoComplete="email"
        defaultValue={state.values?.email}
        error={errors.email?.[0]}
      />

      <SubmitButton pendingText="Enviando...">Enviar enlace</SubmitButton>

      <p className="text-center text-sm text-pearl">
        <Link href="/login" className="font-semibold text-snow underline underline-offset-4">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}