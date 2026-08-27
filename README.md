# AI Cyber Safety Mentor

A focused hackathon MVP that checks pasted SMS, WhatsApp messages, emails, and visible URL text for common scam patterns. It combines deterministic scam-signal detection with an LLM contextual review and returns a concise, validated verdict in English or Hindi.

## Features

- SAFE, SUSPICIOUS, or DANGEROUS verdict with a 0–100 risk score
- Simple explanation, scam category, warning signs, and one recommended action
- English and Hindi output
- Extra safety guidance for dangerous messages
- Local, text-only scam signal detection before the AI call
- Strict request and model-response validation with Zod
- No database, authentication, message history, or link fetching

## Architecture

The UI and API are one Next.js App Router application. `POST /api/analyze` validates input, runs `lib/analyze-signals.ts`, sends the message plus those signals to Google Gemini, validates the structured model output, and only then returns it to the browser.

```text
app/
  api/analyze/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  ActionCard.tsx
  AnalyzerForm.tsx
  ExampleMessages.tsx
  Header.tsx
  LanguageSelector.tsx
  ResultCard.tsx
  RiskBadge.tsx
lib/
  ai.ts
  analyze-signals.ts
  constants.ts
  prompts.ts
  schema.ts
types/
  analysis.ts
```

## How It Works

User Input → Rule-Based Signal Analysis → LLM Contextual Risk Analysis → Structured Validation → Explainable Risk Verdict

The local rules are supporting signals, not the final classifier. They detect items such as urgency, KYC language, OTP/PIN/password requests, payment requests, URL shorteners, IP-address URLs, and remote-access requests. The LLM evaluates those signals in the full context of the message.

## Run Locally

Requirements: a current Node.js LTS release and a Gemini API key.

```bash
npm install
copy .env.example .env.local
npm run dev
```

On macOS/Linux, use `cp .env.example .env.local`. Open `http://localhost:3000`.

Set these server-only variables in `.env.local`:

```text
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.7-flash
```

`GEMINI_MODEL` is optional; the application defaults to `gemini-3.7-flash`. Never use a `NEXT_PUBLIC_` prefix for the API key.

## Checks

```bash
npm run lint
npm run build
npm start
```

## Deploy to Vercel

Import the repository in Vercel, add `GEMINI_API_KEY` and optionally `GEMINI_MODEL` in Project Settings → Environment Variables, then deploy. No database or additional service is needed.

## Privacy and Security

The application does not store messages in a database and never renders user input as HTML. Pasted URLs are treated only as text: the application does not open, fetch, crawl, resolve, preview, or otherwise connect to them. The API key remains server-side. User content is delimited as hostile data in the prompt, and every AI response is checked against a strict Zod schema before reaching the browser.

Google Gemini processes submitted content to generate the analysis, subject to the API account's applicable data controls. Avoid pasting information that is not needed for the safety check.

## Demo Fallback

Gemini is the primary analysis engine. If the provider is temporarily unavailable because of exhausted quota, rate limits, service errors, network connection failures, or timeouts, the app uses a deterministic local scam-signal fallback so a hackathon demonstration can continue.

The fallback uses only the rule-based signals extracted from the pasted text. It does not contact external services or open pasted URLs. Authentication, configuration, model, request, and schema-validation errors do not activate fallback because those require a real fix rather than a substitute result. Fallback results are clearly labeled in the interface.

## Limitations

- This is an AI-assisted assessment, not a guarantee or a statistically calibrated probability.
- It does not inspect destination websites, attachments, sender identity, domain registration, or live threat-intelligence feeds.
- Attack patterns change and both false positives and false negatives are possible.
- Sensitive requests should always be verified through independently found official channels.
- India-specific reporting details in `lib/constants.ts` should be adapted for other regions.
