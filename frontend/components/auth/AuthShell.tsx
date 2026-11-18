import Image from "next/image";
import type { ReactNode } from "react";

type Props = { heading: string; description: string; children: ReactNode };

export default function AuthShell({ heading, description, children }: Props) {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-midnight">
      <Image
        src="/images/bar-fondo.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[25%_center]"
      />
      <div
         aria-hidden
          className="absolute inset-0 bg-black/25 md:bg-[linear-gradient(to_left,rgba(0,0,0,0.5),rgba(0,0,0,0.15),rgba(0,0,0,0))]"
        />

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-10 md:justify-end md:px-[7vw]">
        <section className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-9">
        <header className="mb-7 text-center">
  <h1 className="font-display text-sm font-semibold tracking-[0.3em] text-pearl sm:text-xxl">
    COCTELERÍA
  </h1>
  <h2 className="mt-3 font-display text-6xl italic text-snow sm:text-6xl">{heading}</h2>
  <p className="mt-3 text-sm leading-relaxed text-pearl/80">{description}</p>
</header>
          {children}
        </section>
      </div>
    </main>
  );
}