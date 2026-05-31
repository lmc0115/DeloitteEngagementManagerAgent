import "../loadEnv.js";
import { prepareReportMarkdown } from "../../shared/prepareReportMarkdown.js";
import { splitReviewResponse, normalizeChecklistItems } from "../../shared/splitReviewResponse.js";
import { parseIssuesFromReport } from "../../shared/parseIssuesFromReport.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const RUBRIC_PATH = path.join(ROOT, "prompts", "qa-rubric.md");
const OUTPUT_FORMAT_PATH = path.join(ROOT, "prompts", "output-format.md");
const QC_CHECKLIST_PROMPT_PATH = path.join(ROOT, "prompts", "qc-checklist-prompt.md");

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

const MAX_OUTPUT_TOKENS = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS) || 8192;
const MAX_INPUT_CHARS = Number(process.env.GEMINI_MAX_INPUT_CHARS) || 28000;

function getModelsToTry() {
  return [...new Set([PRIMARY_MODEL, ...FALLBACK_MODELS])];
}

export async function loadRubricPrompt() {
  return fs.readFile(RUBRIC_PATH, "utf-8");
}

export async function loadOutputFormatPrompt() {
  return fs.readFile(OUTPUT_FORMAT_PATH, "utf-8");
}

export async function loadQcChecklistPrompt() {
  return fs.readFile(QC_CHECKLIST_PROMPT_PATH, "utf-8");
}

export async function loadRubricForDisplay() {
  const [rubric, outputFormat] = await Promise.all([
    loadRubricPrompt(),
    loadOutputFormatPrompt(),
  ]);
  return `${rubric.trim()}\n\n---\n\n${outputFormat.trim()}\n`;
}

/** Scoring rules only — omits Output Rules and Category Details (UI reference). */
export function compactRubricForReview(fullRubric) {
  const outputRules = fullRubric.search(/^## Output Rules\s*$/m);
  const categoryDetails = fullRubric.search(/^## Category Details\s*$/m);
  let stop = -1;
  if (outputRules >= 0) stop = outputRules;
  else if (categoryDetails >= 0) stop = categoryDetails;
  if (stop >= 0) return fullRubric.slice(0, stop).trim();
  return fullRubric.trim();
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

function buildReviewPrompt(rubric, outputFormat, qcChecklistPrompt, customRubric, documents) {
  const reviewRubric = compactRubricForReview(rubric);
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
    ? `\n## Additional reviewer requirements (from user)\n\n${customRubric.trim()}\n`
    : "";

  return `${reviewRubric}
${customBlock}

---

${outputFormat}

---

${qcChecklistPrompt}

---

## Deliverables to review

${docBlock}

---

## Your task now

Review the deliverable(s) above and write the **completed QA report** (not a plan, not a summary of these instructions).

Your response **must begin** with:

## Overall Assessment

Rules:
- Score the deliverable using the rubric; cite specific content from the files.
- Do **not** repeat rubric category weights (e.g. "Logic 20%"), output-format section names, or these instructions.
- Do **not** list what you will do — write the full report with scores, issues, and fixes.
- Follow the output format, then append \`---QC_CHECKLIST_JSON---\` and the JSON array.
`;
}

function buildChecklistFallbackPrompt(reportMarkdown) {
  return `You are a QA assistant. Read the review report below and output ONLY a valid JSON array.
One object per distinct issue the human should decide on. Use this exact schema:

[
  {
    "issueNumber": 1,
    "category": "Numbers",
    "severity": "Severity 1 - Critical",
    "severityLevel": "1",
    "location": "Paragraph 1",
    "problem": "What is wrong",
    "businessImpact": "Why it matters",
    "suggestedFix": "What to change"
  }
]

Rules:
- Output ONLY the JSON array. No markdown, no code fences, no explanation.
- Include every issue mentioned in Issues Found, Summary Table, or Top 3 Priorities.
- If the report identifies no issues, output [].

Report:
${reportMarkdown.slice(0, 12000)}
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

function getResponseText(response) {
  return (
    response.text ??
    response.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ??
    ""
  );
}

function isOutputTruncated(response, reportMarkdown) {
  const finishReason = response.candidates?.[0]?.finishReason;
  if (finishReason === "MAX_TOKENS") return true;
  if (!reportMarkdown) return false;
  const hasEnd =
    /##\s*Reviewer Metadata/i.test(reportMarkdown) ||
    /---QC_CHECKLIST_JSON---/.test(String(response.text || ""));
  return !hasEnd && reportMarkdown.length > 500;
}

function looksLikePromptEcho(text) {
  const body = String(text || "").trim();
  if (/^##\s+Overall Assessment/im.test(body)) return false;
  if (/^##\s+Category Scorecard/im.test(body)) return false;

  let signals = 0;
  if (/\bLogic\s*\(?\s*20\s*%\s*\)?/i.test(body)) signals++;
  if (/Report sections \(in order\)/i.test(body)) signals++;
  if (/For each issue found/i.test(body)) signals++;
  if (/Reviewer Metadata/i.test(body) && !/^##/m.test(body)) signals++;
  if (/Communication\s*\(?\s*5\s*%\s*\)?/i.test(body)) signals++;
  return signals >= 2;
}

async function generateForModel(model, prompt, { systemInstruction, maxTokens } = {}) {
  return getClient().models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction:
        systemInstruction ??
        `You are a senior consulting partner performing QA on deliverables.
Write a completed QA report about the uploaded deliverable content.
Never repeat rubric weights, instruction lists, or output-format section names.
Begin with ## Overall Assessment. Output raw Markdown, then ---QC_CHECKLIST_JSON--- and JSON.`,
      temperature: 0.3,
      maxOutputTokens: maxTokens ?? MAX_OUTPUT_TOKENS,
    },
  });
}

async function generateWithRetry(prompt, options = {}) {
  const models = getModelsToTry();
  let lastError;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await generateForModel(model, prompt, options);
        return { response, modelUsed: model, fallback: model !== PRIMARY_MODEL };
      } catch (err) {
        lastError = err;
        const msg = String(err?.message || "");

        if (isQuotaError(msg)) {
          const waitSec = parseRetrySeconds(err);
          if (waitSec <= 35 && attempt < 2) {
            await new Promise((r) => setTimeout(r, waitSec * 1000));
            continue;
          }
          break;
        }

        if (isServerError(msg) && attempt < 2) {
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

async function generateChecklistFallback(reportMarkdown, model) {
  try {
    const { response } = await generateWithRetry(buildChecklistFallbackPrompt(reportMarkdown), {
      systemInstruction:
        "Output ONLY a valid JSON array of QC checklist items. No markdown or prose.",
      maxTokens: 2048,
    });
    const text = getResponseText(response).trim();
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (!arrayMatch) return [];
    return normalizeChecklistItems(JSON.parse(arrayMatch[0]));
  } catch (err) {
    console.warn("[QA Reviewer] Checklist fallback failed:", err.message);
    return parseIssuesFromReport(reportMarkdown);
  }
}

export async function runReview({ documents, customRubric }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env (see .env.example)."
    );
  }

  const [rubric, outputFormat, qcChecklistPrompt] = await Promise.all([
    loadRubricPrompt(),
    loadOutputFormatPrompt(),
    loadQcChecklistPrompt(),
  ]);
  const prompt = buildReviewPrompt(
    rubric,
    outputFormat,
    qcChecklistPrompt,
    customRubric,
    documents
  );

  const { response, modelUsed, fallback } = await generateWithRetry(prompt);

  const rawText = getResponseText(response);
  if (!rawText) {
    throw new Error("Empty response from Gemini. Check API key and model name.");
  }

  const {
    reportMarkdown: reportBody,
    checklistItems: parsedChecklist,
    hasChecklistJson,
  } = splitReviewResponse(rawText);

  let reportText = prepareReportMarkdown(reportBody);
  const outputTruncated = isOutputTruncated(response, reportBody);
  const promptEcho = looksLikePromptEcho(reportBody);

  if (promptEcho) {
    throw new Error(
      "The model returned instructions instead of a QA report. Try again, or set GEMINI_MODEL=gemini-2.0-flash-lite in .env for more reliable formatting."
    );
  }

  let checklistItems = parsedChecklist;
  if (!hasChecklistJson) {
    checklistItems = await generateChecklistFallback(reportText, modelUsed);
  }

  const report =
    fallback && modelUsed !== PRIMARY_MODEL
      ? `> *Note: Primary model (${PRIMARY_MODEL}) was unavailable; this review used **${modelUsed}**.*\n\n${reportText}`
      : reportText;

  return {
    report,
    checklistItems,
    model: modelUsed,
    reviewedAt: new Date().toISOString(),
    fileNames: documents.map((d) => d.name),
    outputTruncated,
  };
}
