import { useState } from "react";
import { generatePdf } from "../utils/pdfExport.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function PdfExportPanel({
  rubric,
  customRubric,
  report,
  reportMeta,
  checklistItems,
  uploadedFileNames,
}) {
  const { lang, t } = useLanguage();
  const [includeRubric, setIncludeRubric] = useState(true);
  const [includeReport, setIncludeReport] = useState(true);
  const [includeChecklist, setIncludeChecklist] = useState(true);

  const fullRubric = customRubric.trim()
    ? `${rubric}\n\n---\n\n## ${t.rubric.additionalSection}\n\n${customRubric.trim()}`
    : rubric;

  function handleDownload() {
    if (!includeRubric && !includeReport && !includeChecklist) {
      alert(t.pdf.alertNoSection);
      return;
    }
    if (includeReport && !report) {
      alert(t.pdf.alertNoReport);
      return;
    }

    generatePdf({
      includeRubric,
      includeReport,
      includeChecklist,
      rubricText: fullRubric,
      reportText: report,
      checklistItems: includeChecklist ? checklistItems : [],
      uploadedFileNames,
      reportMeta,
      labels: t.pdf,
      locale: lang === "fr" ? "fr-CA" : undefined,
    });
  }

  return (
    <section className="card">
      <div className="card-title-row">
        <h2>{t.pdf.title}</h2>
        <span className="card-badge">{t.pdf.badge}</span>
      </div>
      <p className="card-sub">{t.pdf.sub}</p>

      <div className="pdf-options">
        <label>
          <input
            type="checkbox"
            checked={includeRubric}
            onChange={(e) => setIncludeRubric(e.target.checked)}
          />
          {t.pdf.includeRubric}
        </label>
        <label>
          <input
            type="checkbox"
            checked={includeReport}
            onChange={(e) => setIncludeReport(e.target.checked)}
          />
          {t.pdf.includeReport}
        </label>
        <label>
          <input
            type="checkbox"
            checked={includeChecklist}
            onChange={(e) => setIncludeChecklist(e.target.checked)}
          />
          {t.pdf.includeChecklist}
        </label>
      </div>

      <button type="button" className="btn btn-primary" onClick={handleDownload}>
        {t.pdf.download}
      </button>
    </section>
  );
}
