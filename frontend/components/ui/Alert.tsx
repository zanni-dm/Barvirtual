import type { ReactNode } from "react";

export default function Alert({
  variant,
  children,
}: {
  variant: "error" | "success";
  children: ReactNode;
}) {
  const styles =
    variant === "error"
      ? "border-red-400/40 bg-red-500/15 text-red-100"
      : "border-emerald-400/40 bg-emerald-500/15 text-emerald-100";
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${styles}`}
    >
      {children}
    </div>
  );
}