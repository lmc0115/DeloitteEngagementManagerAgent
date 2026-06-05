import { useEffect, useId, useState } from "react";
import MarkdownContent from "./MarkdownContent.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function RubricPanel({ rubric, customRubric, onCustomRubricChange }) {
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

  return (
    <>
      <section className="card card-accent">
        <div className="card-title-row">
          <h2>{t.rubric.title}</h2>
          <div className="card-title-actions">
            <span className="card-badge">{t.rubric.badge}</span>
            <button
              type="button"
              className="btn btn-ghost btn-expand"
              disabled={!rubric}
              onClick={() => setExpanded(true)}
            >
              {t.rubric.expand}
            </button>
          </div>
        </div>
        <p className="card-sub">{t.rubric.sub}</p>

        <div className="rubric-preview prose-panel">
          {rubric ? (
            <MarkdownContent content={rubric} />
          ) : (
            <p className="muted">{t.rubric.loading}</p>
          )}
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="custom-rubric">
            {t.rubric.additionalRequirements}
            <span className="field-optional">{t.rubric.optional}</span>
          </label>
          <p className="field-hint">{t.rubric.hint}</p>
          <textarea
            id="custom-rubric"
            className="field-textarea"
            placeholder={t.rubric.placeholder}
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
                <h2 id={titleId}>{t.rubric.modalTitle}</h2>
                <p className="rubric-modal-sub">{t.rubric.modalSub}</p>
              </div>
              <button
                type="button"
                className="btn btn-secondary rubric-modal-close"
                onClick={() => setExpanded(false)}
              >
                {t.rubric.close}
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
