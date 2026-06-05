import { useLanguage } from "../i18n/LanguageContext.jsx";

function SeverityBadge({ level }) {
  const { t } = useLanguage();
  if (!level) return null;
  return (
    <span className={`severity-badge severity-${level}`}>
      {level} — {t.checklist.severity[level]}
    </span>
  );
}

export default function ChecklistPanel({ items, onItemsChange, hasReport }) {
  const { t } = useLanguage();

  function updateItem(id, patch) {
    onItemsChange(
      items.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  return (
    <section className="card">
      <div className="card-title-row">
        <h2>{t.checklist.title}</h2>
        <span className="card-badge">{t.checklist.badge}</span>
      </div>
      <p className="card-sub">{t.checklist.sub}</p>

      {!hasReport && (
        <p className="checklist-empty muted">{t.checklist.emptyBefore}</p>
      )}

      {hasReport && items.length === 0 && (
        <p className="checklist-empty muted">{t.checklist.emptyAfter}</p>
      )}

      {items.map((item, index) => (
        <article
          key={item.id}
          className={`checklist-item checklist-issue severity-border-${item.severityLevel || "0"}`}
        >
          <div className="checklist-item-header">
            <span className="checklist-num">{index + 1}</span>
            <div className="checklist-issue-body">
              <div className="checklist-issue-title-row">
                <h3 className="checklist-issue-title">
                  {item.category}
                  {item.location ? (
                    <span className="checklist-issue-location"> · {item.location}</span>
                  ) : null}
                </h3>
                <SeverityBadge level={item.severityLevel} />
              </div>
              <p className="checklist-issue-problem">{item.problem}</p>
              {item.businessImpact ? (
                <p className="checklist-issue-impact">
                  <strong>{t.checklist.businessImpact}</strong> {item.businessImpact}
                </p>
              ) : null}
              {item.suggestedFix ? (
                <p className="checklist-issue-fix">
                  <strong>{t.checklist.suggestedFix}</strong> {item.suggestedFix}
                </p>
              ) : null}
            </div>
          </div>
          <label className="checklist-opinion-label" htmlFor={`opinion-${item.id}`}>
            {t.checklist.humanDecision}
          </label>
          <textarea
            id={`opinion-${item.id}`}
            placeholder={t.checklist.placeholder}
            value={item.opinion}
            onChange={(e) => updateItem(item.id, { opinion: e.target.value })}
          />
        </article>
      ))}
    </section>
  );
}
