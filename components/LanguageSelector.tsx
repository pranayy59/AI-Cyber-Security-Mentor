import type { Language } from "@/types/analysis";

interface Props {
  value: Language;
  onChange: (language: Language) => void;
  disabled?: boolean;
}

export function LanguageSelector({ value, onChange, disabled }: Props) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-slate-300">Response language</legend>
      <div className="inline-flex rounded-xl bg-slate-800 p-1" aria-label="Response language">
        {([['en', 'English'], ['hi', 'हिन्दी']] as const).map(([code, label]) => (
          <button
            key={code}
            type="button"
            disabled={disabled}
            onClick={() => onChange(code)}
            aria-pressed={value === code}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              value === code ? "bg-slate-700 text-blue-300 shadow-sm" : "text-slate-400 hover:text-slate-100"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
