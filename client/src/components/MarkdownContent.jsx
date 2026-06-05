import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { normalizeMarkdown } from "../utils/normalizeMarkdown.js";
import { prepareReportMarkdown } from "../utils/prepareReportMarkdown.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function cellText(children) {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(cellText).join("");
  if (children?.props?.children) return cellText(children.props.children);
  return String(children ?? "");
}

function severityLevel(text) {
  const t = text.trim();
  if (/^\d+\s*%$/.test(t)) return null;
  if (/^\d+$/.test(t)) return null;

  if (
    /^Severity\s*1\b/i.test(t) ||
    /^Gravité\s*1\b/i.test(t) ||
    /^Gravite\s*1\b/i.test(t) ||
    /^1\s*[—–-]\s*(?:Critical|Critique)/i.test(t) ||
    /^(?:Critical|Critique)$/i.test(t)
  ) {
    return "1";
  }
  if (
    /^Severity\s*2\b/i.test(t) ||
    /^Gravité\s*2\b/i.test(t) ||
    /^Gravite\s*2\b/i.test(t) ||
    /^2\s*[—–-]\s*(?:Major|Majeur)/i.test(t) ||
    /^(?:Major|Majeur)$/i.test(t)
  ) {
    return "2";
  }
  if (
    /^Severity\s*3\b/i.test(t) ||
    /^Gravité\s*3\b/i.test(t) ||
    /^Gravite\s*3\b/i.test(t) ||
    /^3\s*[—–-]\s*(?:Minor|Mineur)/i.test(t) ||
    /^(?:Minor|Mineur)$/i.test(t)
  ) {
    return "3";
  }
  return null;
}

function SeverityCell({ children }) {
  const { t } = useLanguage();
  const text = cellText(children).trim();
  const level = severityLevel(text);
  if (!level) return <td>{children}</td>;

  return (
    <td>
      <span className={`severity-badge severity-${level}`}>
        {level} — {t.checklist.severity[level]}
      </span>
    </td>
  );
}

function looksLikeMarkdownReport(text) {
  return (
    /^#{1,4}\s+/m.test(text) ||
    /^(\*\*[^*]+\*\*|\*[^*\n]+:\*)/m.test(text) ||
    /^\|\s*(?:Category|Catégorie|Categorie)\s*\|/m.test(text) ||
    /^-\s+\*\*[A-Za-zÀ-ÿ]+:/m.test(text) ||
    /^\d+\.\s+/m.test(text)
  );
}

function ReportProseBlock({ text }) {
  return (
    <div className="md-report-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={buildMarkdownComponents({ forReport: true })}
      >
        {normalizeMarkdown(text)}
      </ReactMarkdown>
    </div>
  );
}

function buildMarkdownComponents({ forReport = false } = {}) {
  return {
    table: ({ children }) => (
      <div className="table-scroll">
        <table className="md-table">{children}</table>
      </div>
    ),
    th: ({ children }) => <th>{children}</th>,
    td: ({ children }) => {
      const text = cellText(children).trim();
      const level = severityLevel(text);
      if (level) {
        return <SeverityCell>{children}</SeverityCell>;
      }
      return <td>{children}</td>;
    },
    h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
    h2: ({ children }) => <h2 className="md-h2 report-section-title">{children}</h2>,
    h3: ({ children }) => <h3 className="md-h3 report-subsection-title">{children}</h3>,
    h4: ({ children }) => <h4 className="md-h4">{children}</h4>,
    p: ({ children }) => <p className="md-p">{children}</p>,
    ul: ({ children }) => <ul className="md-ul">{children}</ul>,
    ol: ({ children }) => <ol className="md-ol">{children}</ol>,
    li: ({ children }) => <li className="md-li">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="md-blockquote report-callout">{children}</blockquote>
    ),
    code: ({ inline, children }) => {
      if (inline) {
        return <code className="md-code-inline">{children}</code>;
      }

      const text = cellText(children).trim();

      if (forReport) {
        if (looksLikeMarkdownReport(text)) {
          return (
            <div className="md-unwrapped-report">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={buildMarkdownComponents({ forReport: true })}
              >
                {normalizeMarkdown(text)}
              </ReactMarkdown>
            </div>
          );
        }
        return <ReportProseBlock text={text} />;
      }

      return (
        <pre className="md-pre">
          <code>{children}</code>
        </pre>
      );
    },
  };
}

export default function MarkdownContent({ content, className = "", forReport = false }) {
  const prepared = forReport ? prepareReportMarkdown(content || "") : content || "";
  const normalized = normalizeMarkdown(prepared);
  const components = buildMarkdownComponents({ forReport });

  return (
    <div className={`markdown-body ${forReport ? "markdown-report" : ""} ${className}`.trim()}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
