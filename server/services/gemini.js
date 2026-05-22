import "../loadEnv.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const RUBRIC_PATH = path.join(ROOT, "prompts", "qa-rubric.md");

let ai;
function getClient() {
  if (!ai) ai = new GoogleGenAI({});
  return ai;
}

const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemma-4-26b-a4b-it";
const FALLBACK_MODELS = (
  process.env.GEMINI_FALLBACK_MODELS || "gemini-2.0-flash-lite,gemini-2.0-flash"
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const MAX_OUTPUT_TOKENS = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS) || 4096;
const MAX_INPUT_CHARS = Number(process.env.GEMINI_MAX_INPUT_CHARS) || 28000;

function getModelsToTry() {
  return [...new Set([PRIMARY_MODEL, ...FALLBACK_MODELS])];
}

export async function loadRubricPrompt() {
  return fs.readFile(RUBRIC_PATH, "utf-8");
}

function truncateDocuments(documents, budget) {
  const withText = documents.filter((d) => d.text);
  if (withText.length === 0) return [];

  const perDoc = Math.max(2000, Math.floor(budget / withText.length));
  return withText.map((d) => ({
    ...d,
    text: d.text.slice(0, perDoc),
    truncated: d.text.length > perDoc,
  }));
}

function buildReviewPrompt(rubric, customRubric, documents) {
  const truncated = truncateDocuments(documents, MAX_INPUT_CHARS);
  const docBlock = truncated
    .map((d, i) => {
      const note = d.truncated
        ? `\n[Note: document truncated for API limits; ${d.charCount} chars total]`
        : "";
      return `### Document ${i + 1}: ${d.name}${note}\n\n${d.text}`;
    })
    .join("\n\n---\n\n");

  const customBlock = customRubric?.trim()
    ? `\n\n## Additional reviewer requirements (from user)\n\n${customRubric.trim()}\n`
    : "";

  return `${rubric}
${customBlock}

---

## Deliverables to review

${docBlock}

---

Respond in **well-structured Markdown** with these sections:

## Overall Assessment
(partner-ready status and brief rationale)

## Top 3 Priorities
(numbered list)

## Strengths
(bullet list, or "None identified" if appropriate)

## Issues Found

For each issue, use this format:

### Issue N: [Short title]
- **Category:** ...
- **Severity:** 1 (Critical) | 2 (Major) | 3 (Minor)
- **Location:** ...
- **Problem:** ...
- **Suggested fix:** ...

## Summary Table

| # | Category | Severity | Location | One-line fix |
|---|----------|----------|----------|--------------|
(fill one row per issue)
`;
}

function parseRetrySeconds(err) {
  const msg = String(err?.message || err || "");
  const match = msg.match(/retry in ([\d.]+)s/i);
  return match ? Math.ceil(Number(match[1])) + 1 : 25;
}

function isQuotaError(msg) {
  return msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");
}

function isServerError(msg) {
  return (
    msg.includes("500") ||
    msg.includes("503") ||
    msg.includes("INTERNAL") ||
    msg.includes("UNAVAILABLE")
  );
}

function formatApiError(err, modelsTried) {
  const msg = String(err?.message || err || "Review failed");

  if (isQuotaError(msg)) {
    const retrySec = parseRetrySeconds(err);
    return (
      `Rate limit reached. Wait about ${retrySec} seconds, then try again with one small file. ` +
      `Models tried: ${modelsTried.join(" → ")}. ` +
      `Limits: https://ai.google.dev/gemini-api/docs/rate-limits`
    );
  }

  if (isServerError(msg)) {
    return (
      `Google's API returned a temporary server error (500/503), often seen with Gemma 4 on the free tier. ` +
      `Wait 30–60 seconds and try again — the app will auto-fallback to ${FALLBACK_MODELS[0] || "gemini-2.0-flash-lite"}. ` +
      `Or set GEMINI_MODEL=gemini-2.0-flash-lite in .env for a more stable default.`
    );
  }

  if (msg.length > 500) return msg.slice(0, 500) + "…";
  return msg;
}

async function generateForModel(model, prompt) {
  return getClient().models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: `You are a senior consulting partner performing QA on deliverables.
You flag issues and suggest fixes. You do NOT author or rewrite the full deliverable.
Be specific, constructive, and aligned with the rubric severity definitions.`,
      temperature: 0.3,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    },
  });
}

async function generateWithRetry(prompt) {
  const models = getModelsToTry();
  let lastError;

  for (const model of models) {
    const attempts = isServerError(String(lastError?.message || "")) ? 2 : 2;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const response = await generateForModel(model, prompt);
        return { response, modelUsed: model, fallback: model !== PRIMARY_MODEL };
      } catch (err) {
        lastError = err;
        const msg = String(err?.message || "");

        if (isQuotaError(msg)) {
          const waitSec = parseRetrySeconds(err);
          if (waitSec <= 35 && attempt < attempts) {
            await new Promise((r) => setTimeout(r, waitSec * 1000));
            continue;
          }
          break;
        }

        if (isServerError(msg) && attempt < attempts) {
          await new Promise((r) => setTimeout(r, 2000 * attempt));
          continue;
        }

        break;
      }
    }

    console.warn(
      `[QA Reviewer] Model ${model} failed, trying next fallback if available.`
    );
  }

  throw new Error(formatApiError(lastError, models));
}

export async function runReview({ documents, customRubric }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env (see .env.example)."
    );
  }

  const rubric = await loadRubricPrompt();
  const prompt = buildReviewPrompt(rubric, customRubric, documents);

  const { response, modelUsed, fallback } = await generateWithRetry(prompt);

  const text =
    response.text ??
    response.candidates?.[0]?.content?.parts
      ?.map((p) => p.text)
      .join("") ??
    "";

  if (!text) {
    throw new Error("Empty response from Gemini. Check API key and model name.");
  }

  const report =
    fallback && modelUsed !== PRIMARY_MODEL
      ? `> *Note: Primary model (${PRIMARY_MODEL}) was unavailable; this review used **${modelUsed}**.*\n\n${text}`
      : text;

  return {
    report,
    model: modelUsed,
    reviewedAt: new Date().toISOString(),
    fileNames: documents.map((d) => d.name),
  };
}
