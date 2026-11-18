import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="font-display text-5xl tracking-[0.2em]">COCTELERÍA</h1>
      <p className="text-pearl">Bar Virtual</p>
      <Link
        href="/login"
        className="rounded-lg bg-snow px-6 py-3 text-sm font-semibold text-midnight hover:bg-pearl"
      >
        Iniciar sesión
      </Link>
    </main>
  );
}