// Rubric type selection shared by server routes and review pipeline.
// A matching copy lives at client/src/utils/rubricTypes.js — keep them in sync.

export const RUBRIC_TYPES = ["document", "excel", "pptx"];
export const DEFAULT_RUBRIC_TYPE = "document";

const EXCEL_EXTS = new Set([".xlsx", ".xls", ".csv"]);
const PPTX_EXTS = new Set([".pptx", ".ppt"]);

function extOf(name) {
  const match = /\.[^.\\/]+$/.exec(String(name || "").toLowerCase());
  return match ? match[0] : "";
}

export function normalizeRubricType(type) {
  return RUBRIC_TYPES.includes(type) ? type : DEFAULT_RUBRIC_TYPE;
}

/**
 * Pick a default rubric type from a list of file names.
 * - Any .pptx/.ppt (without spreadsheets) → "pptx"
 * - Any .xlsx/.xls (without presentations) → "excel"
 * - Otherwise (PDF/Word/text, or a mix of excel + pptx) → "document"
 */
export function detectRubricType(fileNames = []) {
  let hasExcel = false;
  let hasPptx = false;

  for (const name of fileNames) {
    const ext = extOf(name);
    if (EXCEL_EXTS.has(ext)) hasExcel = true;
    else if (PPTX_EXTS.has(ext)) hasPptx = true;
  }

  if (hasPptx && !hasExcel) return "pptx";
  if (hasExcel && !hasPptx) return "excel";
  return DEFAULT_RUBRIC_TYPE;
}
