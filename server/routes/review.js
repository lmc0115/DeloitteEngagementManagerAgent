import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { extractFromUploadedFiles } from "../services/fileParser.js";
import { runReview } from "../services/gemini.js";

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
    const documents = await extractFromUploadedFiles(uploaded);

    const empty = documents.filter((d) => !d.text);
    if (empty.length === documents.length) {
      return res.status(400).json({
        error:
          "Could not extract text from uploaded files. Try .txt, .md, .pdf, or .docx.",
      });
    }

    const result = await runReview({ documents, customRubric });
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
