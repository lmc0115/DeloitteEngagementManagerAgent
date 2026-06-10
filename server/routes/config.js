import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { loadRubricForDisplay } from "../services/gemini.js";
import { normalizeRubricType } from "../../shared/rubricTypes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CHECKLIST_PATH = path.join(ROOT, "config", "default-qc-checklist.json");

const router = Router();

router.get("/rubric", async (req, res) => {
  try {
    const lang = req.query.lang === "fr" ? "fr" : "en";
    const rubricType = normalizeRubricType(req.query.rubricType);
    const content = await loadRubricForDisplay(lang, rubricType);
    res.json({ content, lang, rubricType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/checklist", async (_req, res) => {
  try {
    const raw = await fs.readFile(CHECKLIST_PATH, "utf-8");
    const items = JSON.parse(raw);
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
