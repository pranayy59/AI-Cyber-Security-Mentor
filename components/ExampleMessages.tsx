import { Sparkles } from "lucide-react";
import { EXAMPLES } from "@/lib/constants";
import type { Language } from "@/types/analysis";

interface Props {
  language: Language;
  onSelect: (content: string) => void;
  disabled?: boolean;
}

export function ExampleMessages({ language, onSelect, disabled }: Props) {
  return (
    <div className="mt-5 border-t border-slate-100 pt-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
        <Sparkles className="h-4 w-4 text-blue-500" aria-hidden="true" />
        {language === "hi" ? "उदाहरण आज़माएं" : "Try an example"}
      </div>
      <div className="flex flex-wrap gap-2">
        {EXAMPLES[language].map((example) => (
          <button
            type="button"
            key={example.label}
            disabled={disabled}
            onClick={() => onSelect(example.content)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  );
}
