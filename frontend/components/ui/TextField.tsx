"use client";

import { useId, useState, type ReactNode } from "react";

type Props = {
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  defaultValue?: string;
  autoComplete?: string;
  error?: string;
  hint?: ReactNode;
};

export default function TextField({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  autoComplete,
  error,
  hint,
}: Props) {
  const id = useId();
  const errorId = `${id}-error`;
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-snow">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={isPassword && visible ? "text" : type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`w-full rounded-lg border bg-snow px-3.5 py-2.5 text-sm text-midnight placeholder:text-silver focus:outline-none focus:ring-2 focus:ring-pearl ${
            error ? "border-red-400" : "border-transparent"
          } ${isPassword ? "pr-11" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-silver hover:text-midnight"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {visible ? (
                <>
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              ) : (
                <>
                  <path d="M3 3l18 18" />
                  <path d="M10.6 6.1A10.4 10.4 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 6.6A16.8 16.8 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.4-1" />
                  <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                </>
              )}
            </svg>
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-300">
          {error}
        </p>
      )}
      {hint && <div className="mt-2">{hint}</div>}
    </div>
  );
}