"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  children: ReactNode;
  pendingText: string;
  variant?: "primary" | "secondary";
};

export default function SubmitButton({ children, pendingText, variant = "primary" }: Props) {
  const { pending } = useFormStatus();
  const style =
    variant === "primary"
      ? "bg-snow text-midnight hover:bg-pearl"
      : "border border-white/40 text-snow hover:bg-white/10";

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold tracking-wide transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snow disabled:cursor-not-allowed disabled:opacity-60 ${style}`}
    >
      {pending && (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {pending ? pendingText : children}
    </button>
  );
}