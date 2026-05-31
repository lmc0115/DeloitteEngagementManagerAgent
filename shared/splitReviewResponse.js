const CHECKLIST_DELIMITER = "---QC_CHECKLIST_JSON---";

function severityLevel(severity) {
  const s = String(severity || "").toLowerCase();
  if (s === "1" || s.includes("critical") || /severity\s*1/.test(s)) return "1";
  if (s === "2" || s.includes("major") || /severity\s*2/.test(s)) return "2";
  if (s === "3" || s.includes("minor") || /severity\s*3/.test(s)) return "3";
  return "";
}

/**
 * Normalize AI-generated checklist JSON into UI/PDF checklist items.
 */
export function normalizeChecklistItems(rawItems) {
  if (!Array.isArray(rawItems)) return [];

  return rawItems
    .map((item, index) => {
      const issueNumber = Number(item.issueNumber ?? item.number ?? index + 1);
      const category = String(item.category || item.Category || "General").trim();
      const severity = String(item.severity || item.Severity || "").trim();
      const level = severityLevel(item.severityLevel ?? severity);
      const location = String(item.location || item.Location || "").trim();
      const problem = String(
        item.problem || item.Problem || item.description || ""
      ).trim();
      const businessImpact = String(
        item.businessImpact || item.business_impact || item["Business impact"] || ""
      ).trim();
      const suggestedFix = String(
        item.suggestedFix ||
          item.suggested_fix ||
          item["Suggested fix"] ||
          item.fix ||
          ""
      ).trim();

      if (!problem && !suggestedFix && !category) return null;

      return {
        id: `issue-${issueNumber}`,
        issueNumber,
        category,
        severity,
        severityLevel: level,
        location,
        problem: problem || suggestedFix || "Issue flagged in QA review",
        businessImpact,
        suggestedFix,
        text: `[${category}] ${problem || suggestedFix}`,
        opinion: "",
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.issueNumber - b.issueNumber);
}

function parseChecklistJson(jsonText) {
  const trimmed = jsonText.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return normalizeChecklistItems(parsed);
    if (parsed?.items && Array.isArray(parsed.items)) {
      return normalizeChecklistItems(parsed.items);
    }
  } catch {
    const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return normalizeChecklistItems(JSON.parse(arrayMatch[0]));
      } catch {
        return [];
      }
    }
  }
  return [];
}

/**
 * Split LLM response into display report markdown and structured checklist items.
 */
export function splitReviewResponse(rawText) {
  const text = String(rawText || "").trim();
  if (!text) {
    return { reportMarkdown: "", checklistItems: [], hasChecklistJson: false };
  }

  const delimiterIndex = text.indexOf(CHECKLIST_DELIMITER);
  if (delimiterIndex === -1) {
    return {
      reportMarkdown: text,
      checklistItems: [],
      hasChecklistJson: false,
    };
  }

  const reportMarkdown = text.slice(0, delimiterIndex).trim();
  const jsonPart = text.slice(delimiterIndex + CHECKLIST_DELIMITER.length).trim();
  const jsonPartClean = jsonPart.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/, "");

  return {
    reportMarkdown,
    checklistItems: parseChecklistJson(jsonPartClean),
    hasChecklistJson: true,
  };
}

export { CHECKLIST_DELIMITER };
