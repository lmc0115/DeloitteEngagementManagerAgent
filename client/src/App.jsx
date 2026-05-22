import { useEffect, useState } from "react";
import FileUpload from "./components/FileUpload.jsx";
import RubricPanel from "./components/RubricPanel.jsx";
import ChecklistPanel from "./components/ChecklistPanel.jsx";
import ReportPanel from "./components/ReportPanel.jsx";
import PdfExportPanel from "./components/PdfExportPanel.jsx";

const WORKFLOW = [
  "Create deliverable",
  "LLM QA review",
  "Flag issues",
  "Assign severity",
  "Suggest fixes",
  "Human decides",
];

function checklistFromDefaults(items) {
  return items.map((text, i) => ({
    id: `default-${i}`,
    text,
    opinion: "",
    isCustom: false,
  }));
}

export default function App() {
  const [files, setFiles] = useState([]);
  const [rubric, setRubric] = useState("");
  const [customRubric, setCustomRubric] = useState("");
  const [checklistItems, setChecklistItems] = useState([]);
  const [report, setReport] = useState(null);
  const [reportMeta, setReportMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const [rubricRes, checklistRes] = await Promise.all([
          fetch("/api/rubric"),
          fetch("/api/checklist"),
        ]);
        if (rubricRes.ok) {
          const data = await rubricRes.json();
          setRubric(data.content);
        }
        if (checklistRes.ok) {
          const data = await checklistRes.json();
          setChecklistItems(checklistFromDefaults(data.items));
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadConfig();
  }, []);

  async function runReview() {
    if (files.length === 0) {
      setError("Please upload at least one deliverable file.");
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("customRubric", customRubric);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review failed");

      setReport(data.report);
      setReportMeta({
        model: data.model,
        reviewedAt: data.reviewedAt,
        fileNames: data.fileNames,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const uploadedNames = files.map((f) => f.name);
  const metaFileNames = reportMeta?.fileNames?.length
    ? reportMeta.fileNames
    : uploadedNames;

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand-row">
            <div className="brand-mark" aria-hidden />
            <span className="brand-label">Consulting · Quality Assurance</span>
          </div>
          <h1>Deliverable QA Reviewer</h1>
          <p className="lead">
            LLM quality control for partner-ready mini-decks and memos — flags
            issues, assigns severity, and suggests fixes. You decide what to
            change before review.
          </p>
          <div className="workflow">
            {WORKFLOW.map((step, i) => (
              <span
                key={step}
                className={`workflow-step ${i === 1 && loading ? "active" : ""}`}
              >
                {step}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="app-main">
        <FileUpload files={files} onFilesChange={setFiles} />

        <RubricPanel
          rubric={rubric}
          customRubric={customRubric}
          onCustomRubricChange={setCustomRubric}
        />

        <div className="section-cta">
          <p>
            {files.length > 0
              ? `${files.length} file(s) ready for review`
              : "Upload at least one deliverable to run QA review"}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            disabled={loading || files.length === 0}
            onClick={runReview}
          >
            {loading ? "Reviewing…" : "Run QA review"}
          </button>
        </div>

        <ReportPanel
          report={report}
          meta={reportMeta}
          loading={loading}
          error={error}
        />

        <ChecklistPanel
          items={checklistItems}
          onItemsChange={setChecklistItems}
        />

        <PdfExportPanel
          rubric={rubric}
          customRubric={customRubric}
          report={report}
          reportMeta={reportMeta}
          checklistItems={checklistItems.filter((i) => i.text.trim())}
          uploadedFileNames={metaFileNames}
        />
      </main>
    </>
  );
}
