import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { extractFromUploadedFiles } from "../services/fileParser.js";
import { runReview } from "../services/gemini.js";
import {
  RUBRIC_TYPES,
  detectRubricType,
} from "../../shared/rubricTypes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "../../uploads");

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-() ]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024, files: 10 },
});

const router = Router();

async function cleanupFiles(files) {
  for (const f of files || []) {
    try {
      await fs.unlink(f.path);
    } catch {
      /* ignore */
    }
  }
}

router.post("/review", upload.array("files", 10), async (req, res) => {
  const uploaded = req.files || [];

  try {
    if (uploaded.length === 0) {
      return res.status(400).json({ error: "Upload at least one deliverable file." });
    }

    const customRubric = req.body.customRubric || "";
    const lang = req.body.lang === "fr" ? "fr" : "en";
    // Trust an explicit client selection; otherwise auto-detect from the
    // uploaded file types (same logic the UI uses for its default).
    const rubricType = RUBRIC_TYPES.includes(req.body.rubricType)
      ? req.body.rubricType
      : detectRubricType(uploaded.map((f) => f.originalname));
    const documents = await extractFromUploadedFiles(uploaded);

    const empty = documents.filter((d) => !d.text);
    if (empty.length === documents.length) {
      return res.status(400).json({
        error:
          "Could not extract text from uploaded files. Try .txt, .md, .pdf, .docx, .xlsx, or .pptx.",
      });
    }

    const result = await runReview({ documents, customRubric, lang, rubricType });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message || "Review failed",
    });
  } finally {
    await cleanupFiles(uploaded);
  }
});

export default router;
