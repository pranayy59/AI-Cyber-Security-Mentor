import "server-only";

import { ApiError, GoogleGenAI, ThinkingLevel } from "@google/genai";
import { analysisSchema } from "@/lib/schema";
import { ANALYSIS_JSON_SCHEMA, buildImageUserPrompt, buildUserPrompt, SYSTEM_PROMPT } from "@/lib/prompts";
import type { ScamSignals } from "@/lib/analyze-signals";
import type { AnalysisResult, Language } from "@/types/analysis";

export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";

const GEMINI_MODEL_CANDIDATES = [
  DEFAULT_GEMINI_MODEL,
  "gemini-3.6-flash",
] as const;

function getGeminiModelCandidates() {
  const configuredModel = process.env.GEMINI_MODEL?.trim();
  return [...new Set([
    ...GEMINI_MODEL_CANDIDATES.slice(0, 1),
    ...(configuredModel ? [configuredModel] : []),
    ...GEMINI_MODEL_CANDIDATES.slice(1),
  ])];
}

export function getGeminiModel() {
  return getGeminiModelCandidates()[0];
}

function isUnavailableModelError(error: unknown) {
  return error instanceof ApiError && (
    error.status === 404 ||
    /not found|does not exist|invalid model/i.test(error.message)
  );
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

  const ai = new GoogleGenAI({ apiKey });
  const modelCandidates = getGeminiModelCandidates();
  let response: Awaited<ReturnType<typeof ai.models.generateContent>> | undefined;

  for (const [index, model] of modelCandidates.entries()) {
    const thinkingConfig = model.startsWith("gemini-2.5")
      ? { thinkingBudget: 0 }
      : { thinkingLevel: ThinkingLevel.MINIMAL };

    try {
      response = await ai.models.generateContent({
        model,
        contents: buildUserPrompt(content, language, signals),
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseJsonSchema: ANALYSIS_JSON_SCHEMA,
          thinkingConfig,
          maxOutputTokens: 800,
          httpOptions: {
            timeout: 90_000,
            retryOptions: { attempts: 1 },
          },
        },
      });
      console.info("Gemini model request succeeded", { model });
      break;
    } catch (error) {
      const hasNextCandidate = index < modelCandidates.length - 1;
      if (!hasNextCandidate || !isUnavailableModelError(error)) throw error;
    }
  }

  if (!response) {
    throw new Error("No Gemini model candidate returned a response");
  }

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

export async function analyzeImageWithAI(
  imageBase64: string,
  imageMimeType: string,
  language: Language,
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new GeminiConfigurationError("missing_api_key");

  const ai = new GoogleGenAI({ apiKey });
  const modelCandidates = getGeminiModelCandidates();
  let response: Awaited<ReturnType<typeof ai.models.generateContent>> | undefined;

  for (const [index, model] of modelCandidates.entries()) {
    const thinkingConfig = model.startsWith("gemini-2.5")
      ? { thinkingBudget: 0 }
      : { thinkingLevel: ThinkingLevel.MINIMAL };

    try {
      response = await ai.models.generateContent({
        model,
        contents: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: imageMimeType,
            },
          },
          { text: buildImageUserPrompt(language) },
        ],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseJsonSchema: ANALYSIS_JSON_SCHEMA,
          thinkingConfig,
          maxOutputTokens: 800,
          httpOptions: {
            timeout: 90_000,
            retryOptions: { attempts: 1 },
          },
        },
      });
      console.info("Gemini image model request succeeded", { model });
      break;
    } catch (error) {
      const hasNextCandidate = index < modelCandidates.length - 1;
      if (!hasNextCandidate || !isUnavailableModelError(error)) throw error;
    }
  }

  if (!response) {
    throw new Error("No Gemini model candidate returned an image analysis response");
  }

  const raw = response.text;
  if (!raw) {
    throw new UnverifiedAnalysisError(
      "Model returned no image analysis",
      "empty_response",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new UnverifiedAnalysisError("Model image response was not valid JSON", "invalid_json");
  }

  const validated = analysisSchema.safeParse(parsed);
  if (!validated.success) {
    throw new UnverifiedAnalysisError(
      "Model image response did not match the required schema",
      "schema_validation",
      validated.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  return validated.data;
}
