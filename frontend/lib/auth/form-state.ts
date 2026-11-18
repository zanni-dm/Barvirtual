export type FieldErrors = Partial<Record<string, string[]>>;

export type FormState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: FieldErrors;
  values?: Record<string, string>;
  showResend?: boolean;
};