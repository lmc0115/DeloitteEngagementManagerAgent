import { useEffect, useId, useState } from "react";
import MarkdownContent from "./MarkdownContent.jsx";
import { parseReportSummary } from "../utils/prepareReportMarkdown.js";

function verdictClass(verdict) {
  if (!verdict) return "";
  const v = verdict.toLowerCase();
  if (v.includes("partner ready")) return "verdict-ready";
  if (v.includes("not ready")) return "verdict-not-ready";
  if (v.includes("minor")) return "verdict-minor";
  return "verdict-revision";
}

function ReportSummaryBar({ report }) {
  const { score, verdict, rationale } = parseReportSummary(report);
  if (!score && !verdict) return null;

  return (
    <div className="report-summary-bar">
      {score && (
        <div className="report-summary-score">
          <span className="report-summary-label">Overall score</span>
          <span className="report-summary-value">{score}</span>
        </div>
      )}
      {verdict && (
        <div className={`report-summary-verdict ${verdictClass(verdict)}`}>
          <span className="report-summary-label">Verdict</span>
          <span className="report-summary-value">{verdict}</span>
        </div>
      )}
      {rationale && <p className="report-summary-rationale">{rationale}</p>}
    </div>
  );
}

export default function ReportPanel({ report, meta, loading, error }) {
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
            <strong>Analyzing deliverables</strong>
            <p className="loading-sub">
              Scoring eight categories, applying override rules, and formatting
              the review report. This may take up to a minute on the free tier.
            </p>
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
          <h2>QA review report</h2>
          <div className="card-title-actions">
            <span className="card-badge card-badge-dark">Scored report · v1.0</span>
            <button
              type="button"
              className="btn btn-ghost btn-expand"
              onClick={() => setExpanded(true)}
            >
              Expand report (full screen)
            </button>
          </div>
        </div>

        <div className="report-meta">
          <div className="report-meta-item">
            <span className="report-meta-label">Model</span>
            <span className="report-meta-value">{meta?.model}</span>
          </div>
          <div className="report-meta-item">
            <span className="report-meta-label">Reviewed</span>
            <span className="report-meta-value">
              {meta?.reviewedAt
                ? new Date(meta.reviewedAt).toLocaleString()
                : "—"}
            </span>
          </div>
          <div className="report-meta-item report-meta-item-wide">
            <span className="report-meta-label">Files</span>
            <span className="report-meta-value">{meta?.fileNames?.join(", ")}</span>
          </div>
          <div className="report-meta-item">
            <span className="report-meta-label">Rubric</span>
            <span className="report-meta-value">v1.0</span>
          </div>
        </div>

        <div className="report-document report-preview">
          {meta?.outputTruncated && (
            <div className="report-truncation-banner" role="status">
              Report may be incomplete — the model hit its output length limit. Use
              **Expand report (full screen)** to scroll, or set a higher{" "}
              <code className="inline-code">GEMINI_MAX_OUTPUT_TOKENS</code> in{" "}
              <code className="inline-code">.env</code> and re-run.
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
                <h2 id={titleId}>QA review report</h2>
                <p className="report-modal-sub">
                  {meta?.fileNames?.join(", ")} · {meta?.model}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary report-modal-close"
                onClick={() => setExpanded(false)}
              >
                Close
              </button>
            </header>
            <div className="report-modal-body report-document">{reportBody}</div>
          </div>
        </div>
      )}
    </>
  );
}
