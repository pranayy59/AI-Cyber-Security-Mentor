import "server-only";

import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { analysisSchema } from "@/lib/schema";
import { ANALYSIS_JSON_SCHEMA, buildUserPrompt, SYSTEM_PROMPT } from "@/lib/prompts";
import type { ScamSignals } from "@/lib/analyze-signals";
import type { AnalysisResult, Language } from "@/types/analysis";

export const DEFAULT_GEMINI_MODEL = "gemini-3.7-flash";

export function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

export type UnverifiedAnalysisReason =
  | "empty_response"
  | "invalid_json"
  | "schema_validation";

export class UnverifiedAnalysisError extends Error {
  constructor(
    message: string,
    readonly reason: UnverifiedAnalysisReason,
    readonly validationIssues?: Array<{ path: string; message: string }>,
  ) {
    super(message);
    this.name = "UnverifiedAnalysisError";
  }
}

export class GeminiConfigurationError extends Error {
  constructor(readonly reason: "missing_api_key") {
    super("GEMINI_API_KEY is not configured");
    this.name = "GeminiConfigurationError";
  }
}

export async function analyzeWithAI(
  content: string,
  language: Language,
  signals: ScamSignals,
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new GeminiConfigurationError("missing_api_key");

  const model = getGeminiModel();
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: buildUserPrompt(content, language, signals),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseJsonSchema: ANALYSIS_JSON_SCHEMA,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      maxOutputTokens: 2_048,
      httpOptions: {
        timeout: 45_000,
        retryOptions: { attempts: 1 },
      },
    },
  });

  const raw = response.text;
  if (!raw) {
    throw new UnverifiedAnalysisError(
      "Model returned no analysis",
      "empty_response",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new UnverifiedAnalysisError("Model response was not valid JSON", "invalid_json");
  }

  const validated = analysisSchema.safeParse(parsed);
  if (!validated.success) {
    throw new UnverifiedAnalysisError(
      "Model response did not match the required schema",
      "schema_validation",
      validated.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  return validated.data;
}
