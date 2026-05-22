import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { normalizeMarkdown } from "../utils/normalizeMarkdown.js";

function cellText(children) {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(cellText).join("");
  if (children?.props?.children) return cellText(children.props.children);
  return String(children ?? "");
}

function SeverityCell({ children }) {
  const text = cellText(children).trim();
  const match = text.match(/^(?:Severity:\s*)?(\d)\b|^\s*(\d)\s*[—–-]/i);
  const level = match?.[1] || match?.[2];
  if (!level) return <td>{children}</td>;

  const labels = { 1: "Critical", 2: "Major", 3: "Minor" };
  return (
    <td>
      <span className={`severity-badge severity-${level}`}>
        {level} — {labels[level]}
      </span>
    </td>
  );
}

const markdownComponents = {
  table: ({ children }) => (
    <div className="table-scroll">
      <table className="md-table">{children}</table>
    </div>
  ),
  th: ({ children }) => <th>{children}</th>,
  td: ({ children }) => {
    const text = cellText(children).trim();
    const isSeverity =
      /^[123]\s*[—–-]\s*(Critical|Major|Minor)/i.test(text) ||
      /^[123]$/.test(text) ||
      /^(Critical|Major|Minor)$/i.test(text);
    if (isSeverity) {
      return <SeverityCell>{children}</SeverityCell>;
    }
    return <td>{children}</td>;
  },
  h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
  h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
  h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
  p: ({ children }) => <p className="md-p">{children}</p>,
  ul: ({ children }) => <ul className="md-ul">{children}</ul>,
  ol: ({ children }) => <ol className="md-ol">{children}</ol>,
  li: ({ children }) => <li className="md-li">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="md-blockquote">{children}</blockquote>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code className="md-code-inline">{children}</code>
    ) : (
      <pre className="md-pre">
        <code>{children}</code>
      </pre>
    ),
};

export default function MarkdownContent({ content, className = "" }) {
  const normalized = normalizeMarkdown(content || "");

  return (
    <div className={`markdown-body ${className}`.trim()}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
