import { useEffect, useId, useState } from "react";
import MarkdownContent from "./MarkdownContent.jsx";
import { parseReportSummary, verdictTone } from "../utils/prepareReportMarkdown.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function verdictClass(verdict) {
  return `verdict-${verdictTone(verdict)}`;
}

function ReportSummaryBar({ report }) {
  const { t } = useLanguage();
  const { score, verdict, rationale } = parseReportSummary(report);
  if (!score && !verdict) return null;

  return (
    <div className="report-summary-bar">
      {score && (
        <div className="report-summary-score">
          <span className="report-summary-label">{t.report.overallScore}</span>
          <span className="report-summary-value">{score}</span>
        </div>
      )}
      {verdict && (
        <div className={`report-summary-verdict ${verdictClass(verdict)}`}>
          <span className="report-summary-label">{t.report.verdict}</span>
          <span className="report-summary-value">{verdict}</span>
        </div>
      )}
      {rationale && <p className="report-summary-rationale">{rationale}</p>}
    </div>
  );
}

export default function ReportPanel({ report, meta, loading, error }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!expanded) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") setExpanded(false);
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  if (loading) {
    return (
      <section className="card card-report loading-card">
        <div className="loading">
          <div className="spinner" />
          <div>
            <strong>{t.report.analyzing}</strong>
            <p className="loading-sub">{t.report.analyzingSub}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card card-report">
        <div className="error-banner">{error}</div>
      </section>
    );
  }

  if (!report) return null;

  const reportBody = (
    <>
      <ReportSummaryBar report={report} />
      <MarkdownContent content={report} forReport className="report-markdown" />
    </>
  );

  return (
    <>
      <section className="card card-report">
        <div className="card-title-row">
          <h2>{t.report.title}</h2>
          <div className="card-title-actions">
            <span className="card-badge card-badge-dark">{t.report.badge}</span>
            <button
              type="button"
              className="btn btn-ghost btn-expand"
              onClick={() => setExpanded(true)}
            >
              {t.report.expand}
            </button>
          </div>
        </div>

        <div className="report-meta">
          <div className="report-meta-item">
            <span className="report-meta-label">{t.report.model}</span>
            <span className="report-meta-value">{meta?.model}</span>
          </div>
          <div className="report-meta-item">
            <span className="report-meta-label">{t.report.reviewed}</span>
            <span className="report-meta-value">
              {meta?.reviewedAt
                ? new Date(meta.reviewedAt).toLocaleString()
                : "—"}
            </span>
          </div>
          <div className="report-meta-item report-meta-item-wide">
            <span className="report-meta-label">{t.report.files}</span>
            <span className="report-meta-value">{meta?.fileNames?.join(", ")}</span>
          </div>
          <div className="report-meta-item">
            <span className="report-meta-label">{t.report.rubric}</span>
            <span className="report-meta-value">v1.0</span>
          </div>
        </div>

        <div className="report-document report-preview">
          {meta?.outputTruncated && (
            <div className="report-truncation-banner" role="status">
              {t.report.truncationBanner}
            </div>
          )}
          {reportBody}
        </div>
      </section>

      {expanded && (
        <div
          className="report-modal-overlay"
          role="presentation"
          onClick={() => setExpanded(false)}
        >
          <div
            className="report-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="report-modal-header">
              <div>
                <h2 id={titleId}>{t.report.title}</h2>
                <p className="report-modal-sub">
                  {meta?.fileNames?.join(", ")} · {meta?.model}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary report-modal-close"
                onClick={() => setExpanded(false)}
              >
                {t.report.close}
              </button>
            </header>
            <div className="report-modal-body report-document">{reportBody}</div>
          </div>
        </div>
      )}
    </>
  );
}
