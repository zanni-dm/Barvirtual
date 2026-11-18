export default function PageFallback({ text = "Cargando..." }: { text?: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <p className="text-pearl">{text}</p>
    </main>
  );
}