import { useState } from "react";
import { generatePdf } from "../utils/pdfExport.js";

export default function PdfExportPanel({
  rubric,
  customRubric,
  report,
  reportMeta,
  checklistItems,
  uploadedFileNames,
}) {
  const [includeRubric, setIncludeRubric] = useState(true);
  const [includeReport, setIncludeReport] = useState(true);
  const [includeChecklist, setIncludeChecklist] = useState(true);

  const fullRubric = customRubric.trim()
    ? `${rubric}\n\n---\n\n## Additional requirements\n\n${customRubric.trim()}`
    : rubric;

  function handleDownload() {
    if (!includeRubric && !includeReport && !includeChecklist) {
      alert("Select at least one section to include in the PDF.");
      return;
    }
    if (includeReport && !report) {
      alert("Run a review first to include the AI report in the PDF.");
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
    });
  }

  return (
    <section className="card">
      <div className="card-title-row">
        <h2>Export package</h2>
        <span className="card-badge">PDF download</span>
      </div>
      <p className="card-sub">
        Build a client-ready PDF with rubric, AI report, and/or checklist. File
        names are listed on the cover page.
      </p>

      <div className="pdf-options">
        <label>
          <input
            type="checkbox"
            checked={includeRubric}
            onChange={(e) => setIncludeRubric(e.target.checked)}
          />
          QA rubric (default + additional requirements)
        </label>
        <label>
          <input
            type="checkbox"
            checked={includeReport}
            onChange={(e) => setIncludeReport(e.target.checked)}
          />
          AI review report
        </label>
        <label>
          <input
            type="checkbox"
            checked={includeChecklist}
            onChange={(e) => setIncludeChecklist(e.target.checked)}
          />
          Human QC checklist (issues + your decisions)
        </label>
      </div>

      <button type="button" className="btn btn-primary" onClick={handleDownload}>
        Download PDF
      </button>
    </section>
  );
}
