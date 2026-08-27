import { LockKeyhole, ShieldCheck } from "lucide-react";

export function Header() {
  return (
    <header className="mb-9 text-center sm:mb-12">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 text-white shadow-lg shadow-blue-950/60">
        <ShieldCheck className="h-7 w-7" aria-hidden="true" />
      </div>
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-800/80 bg-slate-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300 shadow-sm">
        <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
        Think before you trust
      </div>
      <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-100 sm:text-5xl">
        AI Cyber Safety <span className="gradient-text">Mentor</span>
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-7 text-slate-300 sm:text-lg">
        Check suspicious messages, emails and links before you trust them.
      </p>
    </header>
  );
}
