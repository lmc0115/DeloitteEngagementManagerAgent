import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

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
    const data = await pdfParse(buffer);
    return data.text || "";
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || "";
  }

  if (ext === ".doc") {
    throw new Error(
      "Legacy .doc files are not supported. Please save as .docx or .pdf."
    );
  }

  throw new Error(
    `Unsupported file type "${ext}". Supported: .txt, .md, .pdf, .docx`
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
