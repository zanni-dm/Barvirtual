import type { ZodTypeAny } from "zod";
import type { FieldErrors } from "@/lib/auth/form-state";

export function validateForm(schema: ZodTypeAny, form: HTMLFormElement): FieldErrors | null {
  const data = Object.fromEntries(new FormData(form).entries());
  const result = schema.safeParse(data);
  if (result.success) return null;
  return result.error.flatten().fieldErrors as FieldErrors;
}