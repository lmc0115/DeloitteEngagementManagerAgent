import MarkdownContent from "./MarkdownContent.jsx";

export default function ReportPanel({ report, meta, loading, error }) {
  if (loading) {
    return (
      <section className="card card-report loading-card">
        <div className="loading">
          <div className="spinner" />
          <div>
            <strong>Analyzing deliverables</strong>
            <p className="loading-sub">
              The AI reviewer is applying the QA rubric. This may take up to a
              minute on the free tier.
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

  return (
    <section className="card card-report">
      <div className="card-title-row">
        <h2>QA review report</h2>
        <span className="card-badge card-badge-dark">AI output</span>
      </div>

      <div className="report-meta">
        <span>
          <strong>Model</strong> {meta?.model}
        </span>
        <span>
          <strong>Reviewed</strong>{" "}
          {meta?.reviewedAt
            ? new Date(meta.reviewedAt).toLocaleString()
            : "—"}
        </span>
        <span>
          <strong>Files</strong> {meta?.fileNames?.join(", ")}
        </span>
      </div>

      <div className="report-content prose-panel">
        <MarkdownContent content={report} />
      </div>
    </section>
  );
}
