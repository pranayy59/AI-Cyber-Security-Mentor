import { EyeOff, Lock, ScanSearch } from "lucide-react";
import { AnalyzerForm } from "@/components/AnalyzerForm";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="orb orb-one" aria-hidden="true" />
      <div className="orb orb-two" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <Header />
        <AnalyzerForm />

        <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-3 text-xs text-slate-500 sm:grid-cols-3">
          <span className="trust-item"><EyeOff aria-hidden="true" />Links are never opened</span>
          <span className="trust-item"><Lock aria-hidden="true" />No message database</span>
          <span className="trust-item"><ScanSearch aria-hidden="true" />Explainable checks</span>
        </div>

        <footer className="mt-10 border-t border-slate-200/80 pt-6 text-center text-xs leading-5 text-slate-500">
          <p>AI-assisted risk assessment. Always verify sensitive requests through official channels.</p>
          <p className="mt-1 font-medium text-slate-600">This tool does not open or visit pasted links.</p>
        </footer>
      </div>
    </main>
  );
}
