"use client";

import { useActionState } from "react";
import Alert from "@/components/ui/Alert";
import SubmitButton from "@/components/ui/SubmitButton";
import TextField from "@/components/ui/TextField";
import { resendVerificationAction } from "@/lib/auth/actions";
import type { FormState } from "@/lib/auth/form-state";

export default function ResendVerificationForm({ email }: { email?: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(resendVerificationAction, {});

  return (
    <form action={formAction} className="mt-5 space-y-4">
      {state.message && <Alert variant={state.ok ? "success" : "error"}>{state.message}</Alert>}
      {email ? (
        <input type="hidden" name="email" value={email} />
      ) : (
        <TextField
          label="Email"
          name="email"
          type="email"
          placeholder="tuemail@ejemplo.com"
          autoComplete="email"
          error={state.fieldErrors?.email?.[0]}
        />
      )}
      <SubmitButton variant="secondary" pendingText="Enviando...">
        Reenviar correo de verificación
      </SubmitButton>
    </form>
  );
}