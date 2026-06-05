const REPORT_HEADING = /^##\s+/m;
const FENCE = /```(?:markdown|md|text)?\s*\n([\s\S]*?)```/gi;

function unwrapOuterFences(text) {
  let t = text.trim();
  for (let i = 0; i < 5; i++) {
    const match = t.match(/^```(?:markdown|md|text)?\s*\n([\s\S]*?)\n```\s*$/i);
    if (!match) break;
    t = match[1].trim();
  }
  return t;
}

function extractFencedBlocks(text) {
  return [...text.matchAll(FENCE)].map((m) => m[1].trim());
}

function stripFromFirstHeading(text) {
  const idx = text.search(/^##\s+/m);
  return idx > 0 ? text.slice(idx) : text;
}

function stripModelPreamble(text) {
  const paragraphs = text.split(/\n\n+/);
  while (paragraphs.length > 1) {
    const first = paragraphs[0].trim();
    const isMeta =
      /performing QA|I will review|As a (?:Senior )?Consulting|markdown structure|rubric categories/i.test(
        first
      ) && !REPORT_HEADING.test(first);
    if (isMeta) {
      paragraphs.shift();
    } else {
      break;
    }
  }
  return paragraphs.join("\n\n");
}

function dedentBlockIndent(text) {
  const lines = text.split("\n");
  const nonEmpty = lines.filter((l) => l.trim());
  if (nonEmpty.length === 0) return text;

  const minIndent = Math.min(
    ...nonEmpty.map((l) => l.match(/^(\s*)/)?.[1].length ?? 0)
  );
  if (minIndent < 4) return text;

  return lines.map((l) => (l.trim() ? l.slice(minIndent) : l)).join("\n");
}

function normalizeSectionLabels(text) {
  let t = text;

  // *Logic:* or *Content Summary:* on its own line -> heading
  t = t.replace(/^\*\s*([^*\n]+?)\s*:\s*\*\s*$/gm, "### $1");
  // *Logic:* inline before paragraph text
  t = t.replace(/^\*\s*([^*\n]+?)\s*:\s*\*\s+(?=\S)/gm, "### $1\n\n");

  // Bullet lines starting with *Label:* (non-italic marker style)
  t = t.replace(/^[-*]\s*\*([^*\n]+?):\*\s*/gm, "- **$1:** ");

  return t;
}

function stripChainOfThought(text) {
  return text
    .split("\n")
    .filter((line) => {
      const t = line.trim();
      if (!t) return true;
      return !/^\*?(?:Wait[,:\s]|Let me[,:\s]|I'll[,:\s]|I need to[,:\s]|thought[,:\s])/i.test(
        t
      );
    })
    .join("\n");
}

function stripTrailingFence(text) {
  return text
    .replace(/^```(?:markdown|md|text)?\s*\n/i, "")
    .replace(/\n```\s*$/, "")
    .trim();
}

/**
 * Normalize LLM review output for Markdown rendering (unwrap fences, drop preamble).
 */
export function prepareReportMarkdown(raw) {
  if (!raw) return "";

  let text = raw.trim();
  text = unwrapOuterFences(text);

  const blocks = extractFencedBlocks(text);
  if (blocks.length > 0) {
    const withHeadings = blocks.filter((b) => REPORT_HEADING.test(b));
    const candidate =
      (withHeadings.length > 0
        ? withHeadings.sort((a, b) => b.length - a.length)[0]
        : blocks.sort((a, b) => b.length - a.length)[0]) || text;

    if (candidate.length >= text.length * 0.35 || REPORT_HEADING.test(candidate)) {
      text = candidate;
    }
  }

  text = stripModelPreamble(text);
  text = stripFromFirstHeading(text);
  text = dedentBlockIndent(text);
  text = normalizeSectionLabels(text);
  text = stripTrailingFence(text);
  text = stripChainOfThought(text);

  return text.trim();
}

function cleanSummaryValue(raw) {
  if (!raw) return null;
  const cleaned = String(raw)
    .replace(/^[\s*•\-–—]+/, "")
    .replace(/\*\*/g, "")
    .trim();
  return cleaned || null;
}

function extractLabeledValue(text, labels) {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const boldMatch = text.match(
      new RegExp(`\\*\\*${escaped}\\s*:\\*\\*\\s*([^\\n]+)`, "i")
    );
    if (boldMatch) return cleanSummaryValue(boldMatch[1]);

    const plainMatch = text.match(
      new RegExp(`(?:^|[\\n\\r])\\s*[-*•]?\\s*${escaped}\\s*:\\s*([^\\n]+)`, "im")
    );
    if (plainMatch) return cleanSummaryValue(plainMatch[1]);
  }
  return null;
}

/**
 * Extract overall score and verdict for the report summary bar.
 */
export function parseReportSummary(markdown) {
  const text = prepareReportMarkdown(markdown || "");
  const assessmentSection =
    text.match(
      /##\s*(?:Overall Assessment|Évaluation globale|Evaluation globale)\s*\n([\s\S]*?)(?=\n##\s|$)/i
    )?.[1] || text;

  const score =
    extractLabeledValue(assessmentSection, ["Overall score", "Score global"]) ||
    extractLabeledValue(text, ["Overall score", "Score global"]);
  const verdict =
    extractLabeledValue(assessmentSection, ["Verdict"]) ||
    extractLabeledValue(text, ["Verdict"]);
  const rationale =
    extractLabeledValue(assessmentSection, ["Rationale", "Justification"]) ||
    extractLabeledValue(text, ["Rationale", "Justification"]);

  return { score, verdict, rationale };
}

export function verdictTone(verdict) {
  if (!verdict) return "revision";
  const v = verdict.toLowerCase();
  if (v.includes("partner ready") || v.includes("prêt pour associé") || v.includes("pret pour associe"))
    return "ready";
  if (v.includes("not ready") || v.includes("non prêt") || v.includes("non pret"))
    return "not-ready";
  if (v.includes("minor") || v.includes("mineure")) return "minor";
  return "revision";
}
