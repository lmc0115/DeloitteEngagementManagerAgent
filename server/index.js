import "./loadEnv.js";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import reviewRouter from "./routes/review.js";
import configRouter from "./routes/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const uploadsDir = path.join(ROOT, "uploads");
await fs.mkdir(uploadsDir, { recursive: true });

app.use("/api", reviewRouter);
app.use("/api", configRouter);

const clientDist = path.join(ROOT, "client", "dist");
try {
  await fs.access(clientDist);
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
} catch {
  // dev mode: client runs on Vite port
}

app.listen(PORT, () => {
  console.log(`QA Reviewer API running at http://localhost:${PORT}`);
});
