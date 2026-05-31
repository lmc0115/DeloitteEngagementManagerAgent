# Consulting Deliverable QA Reviewer

**Project Team 3** — LLM-as-quality-control (not author) for consulting mini-decks and memos.

## What it does

1. **Upload** deliverables (.txt, .md, .pdf, .docx, .xlsx, .pptx)
2. **Review** against the default QA rubric (+ optional custom requirements)
3. **Report** issues with severity (Critical / Major / Minor) and suggested fixes
4. **Human QC checklist** — auto-filled from **Issues Found** in the report; you record whether to modify as suggested
5. **Export PDF** — rubric, AI report, checklist, or any combination (includes uploaded file names)

## Workflow

```
Human/team creates mini deck or memo
        ↓
LLM reviewer checks quality
        ↓
LLM flags issues → assigns severity → suggests fixes
        ↓
Human decides what to change
```

## Customize the rubric (important)

Edit **`prompts/qa-rubric.md`** to change categories, weights, scoring levels, severity rules, or override logic. Edit **`prompts/output-format.md`** to change report structure. Restart the server after edits.

Default checklist items live in **`config/default-qc-checklist.json`** (legacy; the UI now builds the checklist from review report issues).

When a review completes, the AI agent returns a structured **QC checklist** (JSON) alongside the report. If that block is missing, the server asks the model again to generate checklist items from the report text.

## Setup (Google AI Studio free tier)

1. **Get an API key**  
   - Go to [Google AI Studio](https://aistudio.google.com/apikey)  
   - Create an API key (free tier)

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   ```
   GEMINI_API_KEY=your_key_here
   GEMINI_MODEL=gemma-4-26b-a4b-it
   ```

3. **Install and run**
   ```bash
   npm install
   npm install --prefix server
   npm install --prefix client
   npm run dev
   ```

4. **Open the app**  
   - UI: http://localhost:5173  
   - API: http://localhost:3001  

## Production build

```bash
npm run build
npm run start
```

Serves the built UI from the API server at http://localhost:3001

## Project deliverables mapping

| Course deliverable | In this repo |
|--------------------|--------------|
| QA rubric + severity + weighted scoring | `prompts/qa-rubric.md` |
| AI reviewer output format (scorecard, issues) | `prompts/output-format.md` |
| Prototype reviewer + scored results | Run review on 20 sample artifacts; save reports / PDFs |
| Consulting QC checklist (human decisions on flagged issues) | AI-generated `checklistItems` from review API + UI checklist section |

## Benchmark testing (20 artifacts)

Prepare 10 “good” and 10 “flawed” mini-decks/memos, then for each:

1. Upload → **Run QA review** → save PDF or copy report  
2. Note whether Critical/Major issues were correctly flagged on flawed samples and absent on good samples  

## Tech stack

- **Frontend:** React + Vite  
- **Backend:** Node.js + Express  
- **LLM:** Google Gemini via `@google/genai` (AI Studio API key)  
- **PDF:** jsPDF (client-side export)  

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `GEMINI_API_KEY is not set` | Create `.env` from `.env.example` |
| 429 / quota errors | Wait per `retryDelay` (~30–60s). Try `gemma-4-26b-a4b-it` if TPM limits hit you on Gemini; space requests (~15/min on Gemma). See [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) |
| Empty PDF report section | Run **Run QA review** before exporting report |
| .doc not supported | Save as .docx or .pdf |
| .xls / .ppt not supported | Save as .xlsx / .pptx or .pdf |

## License

Academic project — APS1061.
