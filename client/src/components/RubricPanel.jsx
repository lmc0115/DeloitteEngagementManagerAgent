import MarkdownContent from "./MarkdownContent.jsx";

export default function RubricPanel({ rubric, customRubric, onCustomRubricChange }) {
  return (
    <section className="card card-accent">
      <div className="card-title-row">
        <h2>QA rubric</h2>
        <span className="card-badge">Partner-ready checks</span>
      </div>
      <p className="card-sub">
        Default criteria used by the AI reviewer. Edit{" "}
        <code className="inline-code">prompts/qa-rubric.md</code> to change
        categories, severity rules, or examples permanently.
      </p>

      <div className="rubric-preview prose-panel">
        {rubric ? (
          <MarkdownContent content={rubric} />
        ) : (
          <p className="muted">Loading rubric…</p>
        )}
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="custom-rubric">
          Additional requirements
          <span className="field-optional">optional</span>
        </label>
        <p className="field-hint">
          Appended to the default rubric for this review only (client context,
          industry rules, engagement specifics).
        </p>
        <textarea
          id="custom-rubric"
          className="field-textarea"
          placeholder="e.g., Verify all figures use FY2024 baseline. Flag any mention of Competitor X without source."
          value={customRubric}
          onChange={(e) => onCustomRubricChange(e.target.value)}
        />
      </div>
    </section>
  );
}
