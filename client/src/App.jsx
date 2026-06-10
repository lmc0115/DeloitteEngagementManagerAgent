import { useEffect, useState } from "react";
import FileUpload from "./components/FileUpload.jsx";
import RubricPanel from "./components/RubricPanel.jsx";
import ChecklistPanel from "./components/ChecklistPanel.jsx";
import ReportPanel from "./components/ReportPanel.jsx";
import PdfExportPanel from "./components/PdfExportPanel.jsx";
import LanguageSelector from "./components/LanguageSelector.jsx";
import { useLanguage } from "./i18n/LanguageContext.jsx";
import {
  DEFAULT_RUBRIC_TYPE,
  detectRubricType,
} from "./utils/rubricTypes.js";

export default function App() {
  const { lang, t } = useLanguage();
  const [files, setFiles] = useState([]);
  const [rubric, setRubric] = useState("");
  const [rubricType, setRubricType] = useState(DEFAULT_RUBRIC_TYPE);
  const [rubricTypeManual, setRubricTypeManual] = useState(false);
  const [customRubric, setCustomRubric] = useState("");
  const [checklistItems, setChecklistItems] = useState([]);
  const [report, setReport] = useState(null);
  const [reportMeta, setReportMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setReport(null);
    setChecklistItems([]);
    setReportMeta(null);
    setError(null);
  }, [lang]);

  useEffect(() => {
    async function loadConfig() {
      try {
        const rubricRes = await fetch(
          `/api/rubric?lang=${lang}&rubricType=${rubricType}`
        );
        if (rubricRes.ok) {
          const data = await rubricRes.json();
          setRubric(data.content);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadConfig();
  }, [lang, rubricType]);

  // Re-detect the rubric set every time the uploaded files change, so the
  // panel switches to the matching version automatically. A manual dropdown
  // choice persists only until the next upload/removal.
  function handleFilesChange(next) {
    setFiles(next);
    setRubricType(detectRubricType(next.map((f) => f.name)));
    setRubricTypeManual(false);
  }

  function handleRubricTypeChange(nextType) {
    setRubricTypeManual(true);
    setRubricType(nextType);
  }

  async function runReview() {
    if (files.length === 0) {
      setError(t.errors.uploadRequired);
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);
    setChecklistItems([]);

    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("customRubric", customRubric);
    form.append("lang", lang);
    form.append("rubricType", rubricType);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.errors.reviewFailed);

      setReport(data.report);
      setChecklistItems(data.checklistItems || []);
      setReportMeta({
        model: data.model,
        reviewedAt: data.reviewedAt,
        fileNames: data.fileNames,
        outputTruncated: data.outputTruncated,
        lang: data.lang || lang,
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
        <div className="app-header-bar">
          <LanguageSelector />
        </div>
        <div className="app-header-inner">
          <div className="brand-row">
            <div className="brand-mark" aria-hidden />
            <span className="brand-label">{t.brandLabel}</span>
          </div>
          <h1>{t.title}</h1>
          <p className="lead">{t.lead}</p>
          <div className="workflow">
            {t.workflow.map((step, i) => (
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
        <FileUpload files={files} onFilesChange={handleFilesChange} />

        <RubricPanel
          rubric={rubric}
          customRubric={customRubric}
          onCustomRubricChange={setCustomRubric}
          rubricType={rubricType}
          onRubricTypeChange={handleRubricTypeChange}
          rubricTypeAuto={!rubricTypeManual && files.length > 0}
        />

        <div className="section-cta">
          <p>
            {files.length > 0
              ? t.cta.filesReady(files.length)
              : t.cta.uploadFirst}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            disabled={loading || files.length === 0}
            onClick={runReview}
          >
            {loading ? t.cta.reviewing : t.cta.runReview}
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
          hasReport={Boolean(report)}
        />

        <PdfExportPanel
          rubric={rubric}
          customRubric={customRubric}
          report={report}
          reportMeta={reportMeta}
          checklistItems={checklistItems.filter((i) => i.text?.trim())}
          uploadedFileNames={metaFileNames}
        />
      </main>
    </>
  );
}
