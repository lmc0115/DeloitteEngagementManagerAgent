const SEVERITY_LABELS = { 1: "Critical", 2: "Major", 3: "Minor" };

function SeverityBadge({ level }) {
  if (!level) return null;
  return (
    <span className={`severity-badge severity-${level}`}>
      {level} — {SEVERITY_LABELS[level]}
    </span>
  );
}

export default function ChecklistPanel({ items, onItemsChange, hasReport }) {
  function updateItem(id, patch) {
    onItemsChange(
      items.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  return (
    <section className="card">
      <div className="card-title-row">
        <h2>Human QC checklist</h2>
        <span className="card-badge">Issues from report</span>
      </div>
      <p className="card-sub">
        Populated by the AI agent as structured QC checklist items (one per issue).
        Record whether you will modify as suggested, handle differently, or accept
        as-is.
      </p>

      {!hasReport && (
        <p className="checklist-empty muted">
          Run QA review first — checklist items will appear here automatically.
        </p>
      )}

      {hasReport && items.length === 0 && (
        <p className="checklist-empty muted">
          No issues were identified in the review report.
        </p>
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
                  <strong>Business impact:</strong> {item.businessImpact}
                </p>
              ) : null}
              {item.suggestedFix ? (
                <p className="checklist-issue-fix">
                  <strong>Suggested fix:</strong> {item.suggestedFix}
                </p>
              ) : null}
            </div>
          </div>
          <label className="checklist-opinion-label" htmlFor={`opinion-${item.id}`}>
            Human decision
          </label>
          <textarea
            id={`opinion-${item.id}`}
            placeholder="e.g., Modify as suggested · Modify differently because… · Accept as-is · Defer to partner"
            value={item.opinion}
            onChange={(e) => updateItem(item.id, { opinion: e.target.value })}
          />
        </article>
      ))}
    </section>
  );
}
