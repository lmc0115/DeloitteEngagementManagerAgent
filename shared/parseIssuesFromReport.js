import { prepareReportMarkdown } from "./prepareReportMarkdown.js";

function fieldValue(block, name) {
  const re = new RegExp(
    `\\*\\*${name}:\\*\\*\\s*([\\s\\S]*?)(?=\\n-\\s*\\*\\*|\\n#{1,4}\\s|$)`,
    "i"
  );
  return block.match(re)?.[1]?.trim().replace(/\s+/g, " ") || "";
}

function severityLevel(severity) {
  const s = (severity || "").toLowerCase();
  if (s.includes("critical") || /severity\s*1/.test(s)) return "1";
  if (s.includes("major") || /severity\s*2/.test(s)) return "2";
  if (s.includes("minor") || /severity\s*3/.test(s)) return "3";
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
      /#{3,4}\s*Issue\s*(\d+)\s*\n([\s\S]*?)(?=#{3,4}\s*Issue\s*\d+|\n##\s|$)/gi
    ),
  ];

  for (const match of blocks) {
    const num = parseInt(match[1], 10);
    const body = match[2];
    issues.push(
      toChecklistItem(num, {
        category: fieldValue(body, "Category"),
        severity: fieldValue(body, "Severity"),
        location: fieldValue(body, "Location"),
        problem: fieldValue(body, "Problem"),
        businessImpact: fieldValue(body, "Business impact"),
        suggestedFix: fieldValue(body, "Suggested fix"),
      })
    );
  }

  return issues;
}

function parseFromSummaryTable(text) {
  const section = text.match(/##\s*Summary Table\s*\n([\s\S]*?)(?=\n##\s|$)/i)?.[1];
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

function parseLooseBullets(sectionText) {
  const issues = [];
  const chunks = sectionText.split(/\n(?=[-*]\s*\*\*Category:\*\*)/i);

  for (const chunk of chunks) {
    if (!/\*\*Category:\*\*/i.test(chunk)) continue;
    const num = issues.length + 1;
    issues.push(
      toChecklistItem(num, {
        category: fieldValue(chunk, "Category"),
        severity: fieldValue(chunk, "Severity"),
        location: fieldValue(chunk, "Location"),
        problem: fieldValue(chunk, "Problem"),
        businessImpact: fieldValue(chunk, "Business impact"),
        suggestedFix: fieldValue(chunk, "Suggested fix"),
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

  if (/no issues identified/i.test(text) && !/Issue\s*\d+/i.test(text)) {
    return [];
  }

  const sectionText =
    text.match(/##\s*Issues Found\s*\n([\s\S]*?)(?=\n##\s|$)/i)?.[1] || text;

  let issues = parseIssueBlocks(sectionText);
  if (issues.length === 0) issues = parseLooseBullets(sectionText);
  if (issues.length === 0) issues = parseFromSummaryTable(text);

  return issues.sort((a, b) => a.issueNumber - b.issueNumber);
}

export function issuesToChecklistItems(issues) {
  return issues.map((issue) => ({ ...issue, opinion: issue.opinion || "" }));
}
