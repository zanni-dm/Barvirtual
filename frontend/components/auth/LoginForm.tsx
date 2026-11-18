"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import Alert from "@/components/ui/Alert";
import SubmitButton from "@/components/ui/SubmitButton";
import TextField from "@/components/ui/TextField";
import ResendVerificationForm from "@/components/auth/ResendVerificationForm";
import { loginAction } from "@/lib/auth/actions";
import type { FieldErrors, FormState } from "@/lib/auth/form-state";
import { loginSchema } from "@/lib/validations/auth";
import { validateForm } from "@/lib/validations/client";

export default function LoginForm() {
  const [state, formAction] = useActionState<FormState, FormData>(loginAction, {});
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const errors: FieldErrors = { ...state.fieldErrors, ...clientErrors };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const found = validateForm(loginSchema, event.currentTarget);
    if (found) {
      event.preventDefault();
      setClientErrors(found);
    } else {
      setClientErrors({});
    }
  }

  return (
    <>
      <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-5">
        {state.message && <Alert variant="error">{state.message}</Alert>}

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
          placeholder="Ingresá tu contraseña"
          autoComplete="current-password"
          error={errors.password?.[0]}
          hint={
            <div className="text-right">
              <Link
                href="/recuperar-password"
                className="text-sm text-pearl underline-offset-4 hover:text-snow hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          }
        />

        <SubmitButton pendingText="Ingresando...">Iniciar sesión</SubmitButton>

        <p className="text-center text-sm text-pearl">
          ¿No tenés una cuenta?{" "}
          <Link href="/registro" className="font-semibold text-snow underline underline-offset-4">
            Registrate acá
          </Link>
        </p>
      </form>

      {state.showResend && <ResendVerificationForm email={state.values?.email} />}
    </>
  );
}