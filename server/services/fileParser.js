import fs from "fs/promises";
import path from "path";
import { createRequire } from "module";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { OfficeParser } from "officeparser";

// pdf-parse bundles an old pdf.js that prints benign font warnings to the
// console while extracting text from some PDFs, e.g.
//   "Warning: TT: undefined function: 32"
// They don't affect extraction. Lower pdf.js verbosity to errors-only (helps in
// real-worker mode); guarded so a version bump just no-ops instead of crashing.
const require = createRequire(import.meta.url);
try {
  const pdfjs = require("pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js");
  if (pdfjs?.PDFJS) pdfjs.PDFJS.verbosity = 0; // 0 = errors only
} catch {
  /* pdf.js build path changed; warnings remain but parsing is unaffected */
}

/**
 * Parse a PDF while silencing pdf.js's benign "Warning: ..." console noise.
 * pdf.js runs its font interpreter in a fake worker with its own verbosity
 * state, so it logs directly via console.log regardless of the setting above.
 * We scope a filter to the parse call only; save/restore makes it nest-safe.
 */
async function parsePdfQuietly(buffer) {
  const original = console.log;
  console.log = (...args) => {
    if (typeof args[0] === "string" && args[0].startsWith("Warning: ")) return;
    original.apply(console, args);
  };
  try {
    return await pdfParse(buffer);
  } finally {
    console.log = original;
  }
}

const TEXT_EXTENSIONS = new Set([
  ".txt",
  ".md",
  ".markdown",
  ".csv",
  ".json",
  ".html",
  ".htm",
]);

export async function extractTextFromFile(filePath, originalName) {
  const ext = path.extname(originalName || filePath).toLowerCase();

  if (TEXT_EXTENSIONS.has(ext)) {
    return await fs.readFile(filePath, "utf-8");
  }

  if (ext === ".pdf") {
    const buffer = await fs.readFile(filePath);
    const data = await parsePdfQuietly(buffer);
    return data.text || "";
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || "";
  }

  if (ext === ".xlsx" || ext === ".pptx") {
    const ast = await OfficeParser.parseOffice(filePath);
    return ast.toText() || "";
  }

  if (ext === ".doc") {
    throw new Error(
      "Legacy .doc files are not supported. Please save as .docx or .pdf."
    );
  }

  if (ext === ".xls") {
    throw new Error(
      "Legacy .xls files are not supported. Please save as .xlsx or .pdf."
    );
  }

  if (ext === ".ppt") {
    throw new Error(
      "Legacy .ppt files are not supported. Please save as .pptx or .pdf."
    );
  }

  throw new Error(
    `Unsupported file type "${ext}". Supported: .txt, .md, .pdf, .docx, .xlsx, .pptx`
  );
}

export async function extractFromUploadedFiles(files) {
  const results = [];

  for (const file of files) {
    const text = await extractTextFromFile(file.path, file.originalname);
    results.push({
      name: file.originalname,
      text: text.trim(),
      charCount: text.length,
    });
  }

  return results;
}
