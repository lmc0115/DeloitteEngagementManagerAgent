import { useEffect, useId, useState } from "react";
import MarkdownContent from "./MarkdownContent.jsx";

export default function RubricPanel({ rubric, customRubric, onCustomRubricChange }) {
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

  return (
    <>
      <section className="card card-accent">
        <div className="card-title-row">
          <h2>QA rubric</h2>
          <div className="card-title-actions">
            <span className="card-badge">Weighted · v1.0</span>
            <button
              type="button"
              className="btn btn-ghost btn-expand"
              disabled={!rubric}
              onClick={() => setExpanded(true)}
            >
              Expand rubric (full screen)
            </button>
          </div>
        </div>
        <p className="card-sub">
          Eight categories scored 0–100 with partner-readiness thresholds. Criteria
          from <code className="inline-code">prompts/qa-rubric.md</code>; AI output
          format from <code className="inline-code">prompts/output-format.md</code>{" "}
          (shown at the end — scroll down).
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

      {expanded && (
        <div
          className="rubric-modal-overlay"
          role="presentation"
          onClick={() => setExpanded(false)}
        >
          <div
            className="rubric-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="rubric-modal-header">
              <div>
                <h2 id={titleId}>QA rubric &amp; output format</h2>
                <p className="rubric-modal-sub">
                  Full criteria and AI reviewer output specification (v1.0)
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary rubric-modal-close"
                onClick={() => setExpanded(false)}
              >
                Close
              </button>
            </header>
            <div className="rubric-modal-body rubric-preview prose-panel">
              <MarkdownContent content={rubric} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
