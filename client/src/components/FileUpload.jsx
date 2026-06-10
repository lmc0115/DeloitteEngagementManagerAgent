import { useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const ACCEPT =
  ".txt,.md,.markdown,.csv,.pdf,.docx,.xlsx,.pptx,text/plain,text/markdown,text/csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation";

export default function FileUpload({ files, onFilesChange }) {
  const { t } = useLanguage();
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function addFiles(fileList) {
    const next = [...files];
    for (const f of fileList) {
      if (!next.some((x) => x.name === f.name && x.size === f.size)) {
        next.push(f);
      }
    }
    onFilesChange(next);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  function removeAt(index) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  return (
    <section className="card">
      <div className="card-title-row">
        <h2>{t.upload.title}</h2>
        <span className="card-badge">{t.upload.step}</span>
      </div>
      <p className="card-sub">{t.upload.sub}</p>

      <div
        className={`dropzone ${dragOver ? "drag-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="dropzone-icon" aria-hidden>
          ↑
        </div>
        <p>
          <strong>{t.upload.dragDrop}</strong> {t.upload.or}{" "}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => inputRef.current?.click()}
          >
            {t.upload.browse}
          </button>
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`}>
              <span>
                {f.name}{" "}
                <small style={{ color: "var(--text-muted)" }}>
                  ({(f.size / 1024).toFixed(1)} KB)
                </small>
              </span>
              <button type="button" onClick={() => removeAt(i)}>
                {t.upload.remove}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
