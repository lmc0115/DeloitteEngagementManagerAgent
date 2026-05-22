export default function ChecklistPanel({ items, onItemsChange }) {
  function updateItem(id, patch) {
    onItemsChange(
      items.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function removeItem(id) {
    onItemsChange(items.filter((item) => item.id !== id));
  }

  function addItem() {
    onItemsChange([
      ...items,
      {
        id: `custom-${Date.now()}`,
        text: "",
        opinion: "",
        isCustom: true,
      },
    ]);
  }

  return (
    <section className="card">
      <div className="card-title-row">
        <h2>Consulting QC checklist</h2>
        <span className="card-badge">Human fallback</span>
      </div>
      <p className="card-sub">
        Partner-ready checks without the AI — add opinions, remove defaults, or
        add your own checkpoints.
      </p>

      {items.map((item, index) => (
        <div key={item.id} className="checklist-item">
          <div className="checklist-item-header">
            <span className="checklist-num">{index + 1}</span>
            {item.isCustom ? (
              <input
                type="text"
                value={item.text}
                placeholder="Your checklist point…"
                onChange={(e) => updateItem(item.id, { text: e.target.value })}
              />
            ) : (
              <p>{item.text}</p>
            )}
            <button
              type="button"
              className="btn-ghost"
              onClick={() => removeItem(item.id)}
              title="Remove this checkpoint"
            >
              Remove
            </button>
          </div>
          <textarea
            placeholder="Your opinion / notes for this checkpoint…"
            value={item.opinion}
            onChange={(e) => updateItem(item.id, { opinion: e.target.value })}
          />
        </div>
      ))}

      <div className="btn-row">
        <button type="button" className="btn btn-secondary" onClick={addItem}>
          + Add checkpoint
        </button>
      </div>
    </section>
  );
}
