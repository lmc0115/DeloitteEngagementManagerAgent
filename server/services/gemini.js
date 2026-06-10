import "../loadEnv.js";
import { prepareReportMarkdown } from "../../shared/prepareReportMarkdown.js";
import { splitReviewResponse, normalizeChecklistItems } from "../../shared/splitReviewResponse.js";
import { parseIssuesFromReport } from "../../shared/parseIssuesFromReport.js";
import { normalizeRubricType, DEFAULT_RUBRIC_TYPE } from "../../shared/rubricTypes.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PROMPTS_DIR = path.join(ROOT, "prompts");

function normalizeLang(lang) {
  return lang === "fr" ? "fr" : "en";
}

/**
 * Candidate prompt filenames for a base name, language, and rubric type,
 * in priority order. Falls back from type+lang → type+en → document+lang →
 * document+en, so French and type-specific prompts degrade gracefully when a
 * variant file does not exist yet.
 */
function promptCandidates(baseName, lang, rubricType) {
  const type = normalizeRubricType(rubricType);
  const typePart = type !== DEFAULT_RUBRIC_TYPE ? `.${type}` : "";
  const langPart = lang === "fr" ? ".fr" : "";

  const names = [];
  const push = (n) => {
    if (!names.includes(n)) names.push(n);
  };

  push(`${baseName}${typePart}${langPart}.md`);
  push(`${baseName}${typePart}.md`);
  if (typePart) {
    push(`${baseName}${langPart}.md`);
    push(`${baseName}.md`);
  }

  return names.map((n) => path.join(PROMPTS_DIR, n));
}

async function readPrompt(baseName, lang, rubricType) {
  const candidates = promptCandidates(baseName, lang, rubricType);
  let lastErr;
  for (const candidate of candidates) {
    try {
      return await fs.readFile(candidate, "utf-8");
    } catch (err) {
      if (err?.code !== "ENOENT") throw err;
      lastErr = err;
    }
  }
  throw lastErr || new Error(`Prompt not found: ${baseName}`);
}

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

function resolveMaxOutputTokens(override) {
  if (override != null && Number(override) > 0) return Number(override);

  const raw = process.env.GEMINI_MAX_OUTPUT_TOKENS;
  if (raw === undefined || String(raw).trim() === "") return 32768;
  if (/^(0|unlimited|max|none)$/i.test(String(raw).trim())) return null;

  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 32768;
}
const MAX_INPUT_CHARS = Number(process.env.GEMINI_MAX_INPUT_CHARS) || 28000;

function getModelsToTry() {
  return [...new Set([PRIMARY_MODEL, ...FALLBACK_MODELS])];
}

export async function loadRubricPrompt(lang = "en", rubricType = DEFAULT_RUBRIC_TYPE) {
  return readPrompt("qa-rubric", normalizeLang(lang), rubricType);
}

export async function loadOutputFormatPrompt(lang = "en", rubricType = DEFAULT_RUBRIC_TYPE) {
  return readPrompt("output-format", normalizeLang(lang), rubricType);
}

// QC checklist generation is identical across rubric types — language only.
export async function loadQcChecklistPrompt(lang = "en") {
  return readPrompt("qc-checklist-prompt", normalizeLang(lang), DEFAULT_RUBRIC_TYPE);
}

export async function loadRubricForDisplay(lang = "en", rubricType = DEFAULT_RUBRIC_TYPE) {
  const [rubric, outputFormat] = await Promise.all([
    loadRubricPrompt(lang, rubricType),
    loadOutputFormatPrompt(lang, rubricType),
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

function buildReviewPrompt(rubric, outputFormat, qcChecklistPrompt, customRubric, documents, lang = "en") {
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
    ? `\n## ${lang === "fr" ? "Exigences supplémentaires du réviseur (utilisateur)" : "Additional reviewer requirements (from user)"}\n\n${customRubric.trim()}\n`
    : "";

  const languageBlock =
    lang === "fr"
      ? `\n## Langue de sortie\n\nRédigez **l'intégralité** du rapport QA en **français** (titres de sections, verdicts, justifications, problèmes, corrections). Utilisez les libellés du format de sortie français.\n`
      : "";

  const deliverablesHeading =
    lang === "fr" ? "## Livrables à revoir" : "## Deliverables to review";
  const taskHeading = lang === "fr" ? "## Votre tâche maintenant" : "## Your task now";
  const taskIntro =
    lang === "fr"
      ? "Revoyez le(s) livrable(s) ci-dessus et rédigez le **rapport QA complet** (pas un plan, pas un résumé de ces instructions)."
      : "Review the deliverable(s) above and write the **completed QA report** (not a plan, not a summary of these instructions).";
  const mustBegin =
    lang === "fr"
      ? "Votre réponse **doit commencer** par :\n\n## En-tête"
      : "Your response **must begin** with:\n\n## Header";
  const thenContinue =
    lang === "fr"
      ? "Puis continuez avec ## Évaluation globale et toutes les sections restantes dans l'ordre."
      : "Then continue with ## Overall Assessment and all remaining sections in order.";

  return `${reviewRubric}
${customBlock}
${languageBlock}

---

${outputFormat}

---

${qcChecklistPrompt}

---

${deliverablesHeading}

${docBlock}

---

${taskHeading}

${taskIntro}

${mustBegin}

${thenContinue}

Rules:
- Score the deliverable using the rubric; cite specific content from the files.
- In ${lang === "fr" ? "En-tête" : "Header"}, list every filename from the Deliverables section above.
- Do **not** repeat rubric category weights (e.g. a category followed by its percentage), output-format section names, or these instructions.
- Do **not** list what you will do — write the full report with scores, issues, and fixes.
- Apply v2 severity rules: approximate/hedged figures → Minor; unsourced statistics → Critical.
- Follow the output format, then append \`---QC_CHECKLIST_JSON---\` and the JSON array.
`;
}

function buildChecklistFallbackPrompt(reportMarkdown, lang = "en") {
  if (lang === "fr") {
    return `Vous êtes un assistant QA. Lisez le rapport de revue ci-dessous et produisez UNIQUEMENT un tableau JSON valide.
Un objet par problème distinct sur lequel l'humain doit décider. Utilisez exactement ce schéma :

[
  {
    "issueNumber": 1,
    "category": "Chiffres",
    "severity": "Gravité 1 – Critique",
    "severityLevel": "1",
    "location": "Paragraphe 1",
    "problem": "Ce qui ne va pas",
    "businessImpact": "Pourquoi c'est important",
    "suggestedFix": "Quoi modifier"
  }
]

Règles :
- Produisez UNIQUEMENT le tableau JSON. Pas de markdown, pas de blocs de code, pas d'explication.
- Incluez chaque problème mentionné dans Problèmes identifiés, Tableau récapitulatif ou Top 3 priorités.
- Si le rapport n'identifie aucun problème, produisez [].

Rapport :
${reportMarkdown.slice(0, 12000)}
`;
  }

  return `You are a QA assistant. Read the review report below and output ONLY a valid JSON array.
One object per distinct issue the human should decide on. Use this exact schema:

[
  {
    "issueNumber": 1,
    "category": "Numbers",
    "severity": "Severity 1 – Critical",
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
    /##\s*(?:Reviewer Metadata|Métadonnées du réviseur|Metadonnees du reviseur)/i.test(reportMarkdown) ||
    /---QC_CHECKLIST_JSON---/.test(String(response.text || ""));
  return !hasEnd && reportMarkdown.length > 500;
}

function looksLikePromptEcho(text) {
  const body = String(text || "").trim();
  if (/^##\s+Header/im.test(body)) return false;
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

async function generateForModel(model, prompt, { systemInstruction, maxTokens, lang = "en" } = {}) {
  const resolved = resolveMaxOutputTokens(maxTokens);
  const defaultSystemEn = `You are a senior consulting partner performing QA on deliverables.
Write a completed QA report about the uploaded deliverable content.
Never repeat rubric weights, instruction lists, or output-format section names.
Begin with ## Header, then ## Overall Assessment. Output raw Markdown, then ---QC_CHECKLIST_JSON--- and JSON.`;
  const defaultSystemFr = `Vous êtes un associé conseil senior effectuant le QA des livrables.
Rédigez un rapport QA complet sur le contenu téléversé, entièrement en français.
Ne répétez jamais les poids de la grille, listes d'instructions ou noms de sections du format de sortie.
Commencez par ## En-tête, puis ## Évaluation globale. Produisez du Markdown brut, puis ---QC_CHECKLIST_JSON--- et le JSON.`;
  const config = {
    systemInstruction:
      systemInstruction ??
      (lang === "fr" ? defaultSystemFr : defaultSystemEn),
    temperature: 0.3,
  };
  if (resolved != null) {
    config.maxOutputTokens = resolved;
  }

  return getClient().models.generateContent({
    model,
    contents: prompt,
    config,
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

async function generateChecklistFallback(reportMarkdown, model, lang = "en") {
  try {
    const { response } = await generateWithRetry(
      buildChecklistFallbackPrompt(reportMarkdown, lang),
      {
        systemInstruction:
          lang === "fr"
            ? "Produisez UNIQUEMENT un tableau JSON valide d'éléments de liste QC. Pas de markdown ni de prose."
            : "Output ONLY a valid JSON array of QC checklist items. No markdown or prose.",
        maxTokens: 2048,
        lang,
      }
    );
    const text = getResponseText(response).trim();
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (!arrayMatch) return [];
    return normalizeChecklistItems(JSON.parse(arrayMatch[0]));
  } catch (err) {
    console.warn("[QA Reviewer] Checklist fallback failed:", err.message);
    return parseIssuesFromReport(reportMarkdown);
  }
}

export async function runReview({
  documents,
  customRubric,
  lang = "en",
  rubricType = DEFAULT_RUBRIC_TYPE,
}) {
  const resolvedLang = normalizeLang(lang);
  const resolvedType = normalizeRubricType(rubricType);

  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env (see .env.example)."
    );
  }

  const [rubric, outputFormat, qcChecklistPrompt] = await Promise.all([
    loadRubricPrompt(resolvedLang, resolvedType),
    loadOutputFormatPrompt(resolvedLang, resolvedType),
    loadQcChecklistPrompt(resolvedLang),
  ]);
  const prompt = buildReviewPrompt(
    rubric,
    outputFormat,
    qcChecklistPrompt,
    customRubric,
    documents,
    resolvedLang
  );

  const { response, modelUsed, fallback } = await generateWithRetry(prompt, {
    lang: resolvedLang,
  });

  const rawText = getResponseText(response);
  if (!rawText) {
    throw new Error("Empty response from Gemini. Check API key and model name.");
  }

  const {
    reportMarkdown: reportBody,
    checklistItems: parsedChecklist,
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

  // Model often emits ---QC_CHECKLIST_JSON--- but truncates JSON or returns [] while Issues Found has rows.
  if (checklistItems.length === 0) {
    checklistItems = parseIssuesFromReport(reportText);
  }

  if (checklistItems.length === 0) {
    checklistItems = await generateChecklistFallback(reportText, modelUsed, resolvedLang);
  }

  const fallbackNoteEn = `> *Note: Primary model (${PRIMARY_MODEL}) was unavailable; this review used **${modelUsed}**.*\n\n`;
  const fallbackNoteFr = `> *Note : Le modèle principal (${PRIMARY_MODEL}) était indisponible ; cette revue a utilisé **${modelUsed}**.*\n\n`;
  const report =
    fallback && modelUsed !== PRIMARY_MODEL
      ? `${resolvedLang === "fr" ? fallbackNoteFr : fallbackNoteEn}${reportText}`
      : reportText;

  return {
    report,
    checklistItems,
    model: modelUsed,
    reviewedAt: new Date().toISOString(),
    fileNames: documents.map((d) => d.name),
    outputTruncated,
    lang: resolvedLang,
    rubricType: resolvedType,
  };
}
