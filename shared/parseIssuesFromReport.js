import { prepareReportMarkdown } from "./prepareReportMarkdown.js";

const FIELD_ALIASES = {
  category: ["Category", "Catégorie", "Categorie"],
  severity: ["Severity", "Gravité", "Gravite"],
  location: ["Location", "Emplacement"],
  problem: ["Problem", "Constat"],
  businessImpact: ["Business impact", "Impact commercial"],
  suggestedFix: ["Suggested fix", "Correction suggérée", "Correction suggeree"],
};

function fieldValue(block, fieldKey) {
  for (const name of FIELD_ALIASES[fieldKey] || []) {
    const re = new RegExp(
      `\\*\\*${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\*\\*\\s*([\\s\\S]*?)(?=\\n-\\s*\\*\\*|\\n#{1,4}\\s|$)`,
      "i"
    );
    const match = block.match(re)?.[1]?.trim().replace(/\s+/g, " ");
    if (match) return match;
  }
  return "";
}

function severityLevel(severity) {
  const s = (severity || "").toLowerCase();
  if (s.includes("critical") || s.includes("critique") || /(?:severity|gravité|gravite)\s*1/.test(s))
    return "1";
  if (s.includes("major") || s.includes("majeur") || /(?:severity|gravité|gravite)\s*2/.test(s))
    return "2";
  if (s.includes("minor") || s.includes("mineur") || /(?:severity|gravité|gravite)\s*3/.test(s))
    return "3";
  return "";
}

function toChecklistItem(issueNumber, fields) {
  const category = fields.category || "General";
  const problem = fields.problem || fields.suggestedFix || "Issue identified in review";
  const suggestedFix = fields.suggestedFix || "";
  const severity = fields.severity || "";
  const location = fields.location || "";

  return {
    id: `issue-${issueNumber}`,
    issueNumber,
    category,
    severity,
    severityLevel: severityLevel(severity),
    location,
    problem,
    businessImpact: fields.businessImpact || "",
    suggestedFix,
    text: `[${category}] ${problem}`,
    opinion: "",
  };
}

function parseIssueBlocks(sectionText) {
  const issues = [];
  const blocks = [
    ...sectionText.matchAll(
      /#{3,4}\s*(?:Issue|Problème|Probleme)\s*(\d+)\s*\n([\s\S]*?)(?=#{3,4}\s*(?:Issue|Problème|Probleme)\s*\d+|\n##\s|$)/gi
    ),
  ];

  for (const match of blocks) {
    const num = parseInt(match[1], 10);
    const body = match[2];
    issues.push(
      toChecklistItem(num, {
        category: fieldValue(body, "category"),
        severity: fieldValue(body, "severity"),
        location: fieldValue(body, "location"),
        problem: fieldValue(body, "problem"),
        businessImpact: fieldValue(body, "businessImpact"),
        suggestedFix: fieldValue(body, "suggestedFix"),
      })
    );
  }

  return issues;
}

function parseFromSummaryTable(text) {
  const section = text.match(
    /##\s*(?:Summary Table|Tableau récapitulatif|Tableau recapitulatif)\s*\n([\s\S]*?)(?=\n##\s|$)/i
  )?.[1];
  if (!section) return [];

  const rows = [...section.matchAll(/^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/gm)];
  return rows
    .filter((row) => row[1] !== "#" && !/^[-—]+$/.test(row[2].trim()))
    .map((row) =>
      toChecklistItem(parseInt(row[1], 10), {
        category: row[2].trim(),
        severity: row[3].trim(),
        location: row[4].trim(),
        problem: row[5].trim(),
        suggestedFix: row[5].trim(),
      })
    );
}

function categoryFieldPattern() {
  return FIELD_ALIASES.category.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
}

function parseLooseBullets(sectionText) {
  const issues = [];
  const re = new RegExp(`\\n(?=[-*]\\s*\\*\\*(?:${categoryFieldPattern()}):\\*\\*)`, "i");
  const chunks = sectionText.split(re);

  for (const chunk of chunks) {
    if (!new RegExp(`\\*\\*(?:${categoryFieldPattern()}):\\*\\*`, "i").test(chunk)) continue;
    const num = issues.length + 1;
    issues.push(
      toChecklistItem(num, {
        category: fieldValue(chunk, "category"),
        severity: fieldValue(chunk, "severity"),
        location: fieldValue(chunk, "location"),
        problem: fieldValue(chunk, "problem"),
        businessImpact: fieldValue(chunk, "businessImpact"),
        suggestedFix: fieldValue(chunk, "suggestedFix"),
      })
    );
  }

  return issues;
}

/**
 * Extract Issues Found from an AI review report for the human QC checklist.
 */
export function parseIssuesFromReport(raw) {
  const text = prepareReportMarkdown(raw || "");

  if (
    /no issues identified|aucun problème identifié|aucun probleme identifie/i.test(text) &&
    !/(?:Issue|Problème|Probleme)\s*\d+/i.test(text)
  ) {
    return [];
  }

  const sectionText =
    text.match(
      /##\s*(?:Issues Found|Problèmes identifiés|Problemes identifies)\s*\n([\s\S]*?)(?=\n##\s|$)/i
    )?.[1] || text;

  let issues = parseIssueBlocks(sectionText);
  if (issues.length === 0) issues = parseLooseBullets(sectionText);
  if (issues.length === 0) issues = parseFromSummaryTable(text);

  return issues.sort((a, b) => a.issueNumber - b.issueNumber);
}

export function issuesToChecklistItems(issues) {
  return issues.map((issue) => ({ ...issue, opinion: issue.opinion || "" }));
}
