import { NextResponse } from "next/server";
import { ApiError } from "@google/genai";
import {
  analyzeImageWithAI,
  analyzeWithAI,
  GeminiConfigurationError,
  getGeminiModel,
  UnverifiedAnalysisError,
} from "@/lib/ai";
import { analyzeSignals } from "@/lib/analyze-signals";
import { analyzeWithFallback } from "@/lib/fallback-analysis";
import { analyzeRequestSchema } from "@/lib/schema";
import type { AnalysisResponse } from "@/types/analysis";

export const runtime = "nodejs";

type AIErrorCategory =
  | "quota"
  | "rate_limit"
  | "service"
  | "connection"
  | "auth"
  | "configuration"
  | "invalid_response"
  | "unknown";

function classifyGeminiError(error: unknown): AIErrorCategory {
  if (error instanceof GeminiConfigurationError) return "configuration";
  if (error instanceof UnverifiedAnalysisError) return "invalid_response";

  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) return "auth";
    if (error.status === 408 || error.status === 504) return "connection";
    if (error.status === 429) {
      return /quota|resource.?exhausted|billing|limit.{0,20}exceed/i.test(error.message)
        ? "quota"
        : "rate_limit";
    }
    if (error.status >= 500) return "service";
    if (error.status >= 400 && error.status < 500) return "configuration";
    return "unknown";
  }

  if (error instanceof Error) {
    if (error.name === "AbortError" || error.name === "TimeoutError") return "connection";
    if (error instanceof TypeError && /fetch failed|network|socket|timed?\s*out/i.test(error.message)) {
      return "connection";
    }
  }

  return "unknown";
}

function isFallbackEligible(category: AIErrorCategory) {
  return category === "quota" || category === "rate_limit" || category === "service" || category === "connection";
}

function redactSecrets(value: string) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  let safeValue = apiKey ? value.replaceAll(apiKey, "[REDACTED]") : value;
  safeValue = safeValue.replace(/([?&]key=)[^&\s]+/gi, "$1[REDACTED]");
  return safeValue;
}

function getDevelopmentErrorDetails(error: unknown) {
  if (process.env.NODE_ENV !== "development" || !(error instanceof Error)) return undefined;

  const cause = error.cause instanceof Error
    ? {
        name: error.cause.name,
        message: redactSecrets(error.cause.message),
        code: "code" in error.cause ? String(error.cause.code) : undefined,
      }
    : undefined;

  return {
    name: error.name,
    message: redactSecrets(error.message),
    cause,
  };
}

function logAnalysisFailure(error: unknown) {
  const category = classifyGeminiError(error);
  const developmentError = getDevelopmentErrorDetails(error);

  if (error instanceof GeminiConfigurationError) {
    console.error("Analysis request failed", {
      source: "gemini",
      category,
      reason: error.reason,
      envLocalRequired: true,
      model: getGeminiModel(),
      error: developmentError,
    });
    return;
  }

  if (error instanceof ApiError) {
    console.error("Analysis request failed", {
      source: "gemini",
      category,
      status: error.status,
      model: getGeminiModel(),
      error: developmentError,
    });
    return;
  }

  if (error instanceof UnverifiedAnalysisError) {
    console.error("Analysis response could not be verified", {
      source: "gemini",
      category,
      reason: error.reason,
      validationIssues: error.validationIssues ?? null,
      model: getGeminiModel(),
      error: developmentError,
    });
    return;
  }

  console.error("Analysis request failed", {
    source: "application",
    category,
    name: error instanceof Error ? error.name : "UnknownError",
    model: getGeminiModel(),
    error: developmentError,
    // Do not log arbitrary error messages: provider errors can contain
    // sensitive request details. Known Gemini errors are classified above.
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const requestResult = analyzeRequestSchema.safeParse(body);
  if (!requestResult.success) {
    return NextResponse.json(
      { error: requestResult.error.issues[0]?.message || "Please check your input and try again." },
      { status: 400 },
    );
  }

  const analysisRequest = requestResult.data;
  const { language } = analysisRequest;
  const isImageRequest = "image" in analysisRequest;
  const signals = isImageRequest ? null : analyzeSignals(analysisRequest.content);

  try {
    try {
      const analysis = isImageRequest
        ? await analyzeImageWithAI(
            analysisRequest.image,
            analysisRequest.imageMimeType,
            language,
          )
        : await analyzeWithAI(analysisRequest.content, language, signals!);
      const response: AnalysisResponse = { ...analysis, analysisSource: "ai" };
      console.info("Analysis completed", {
        source: "gemini",
        input: isImageRequest ? "image" : "text",
        model: getGeminiModel(),
      });
      return NextResponse.json(response);
    } catch (error) {
      const category = classifyGeminiError(error);
      if (isFallbackEligible(category)) {
        logAnalysisFailure(error);
        if (isImageRequest) {
          console.warn("Image analysis unavailable; text fallback required", {
            source: "gemini",
            category,
            model: getGeminiModel(),
          });
          return NextResponse.json(
            {
              error: language === "hi"
                ? "चित्र का विश्लेषण अभी उपलब्ध नहीं है। कृपया संदेश का टेक्स्ट पेस्ट करें।"
                : "Image analysis is temporarily unavailable. Please paste the message text instead.",
            },
            { status: 503 },
          );
        }
        console.warn("Using deterministic fallback analysis", {
          source: "fallback",
          category,
          model: getGeminiModel(),
        });
        const analysis = analyzeWithFallback(analysisRequest.content, language, signals!);
        const response: AnalysisResponse = { ...analysis, analysisSource: "fallback" };
        return NextResponse.json(response);
      }
      throw error;
    }
  } catch (error) {

    logAnalysisFailure(error);

    if (error instanceof UnverifiedAnalysisError) {
      return NextResponse.json(
        { error: "Analysis couldn't be verified. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: "We couldn't complete the analysis. Please try again." },
      { status: 500 },
    );
  }
}
