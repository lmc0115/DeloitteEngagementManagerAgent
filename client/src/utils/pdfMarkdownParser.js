import { marked } from "marked";
import { normalizeMarkdown } from "./normalizeMarkdown.js";

marked.setOptions({ gfm: true, breaks: true });

function inlineText(token) {
  if (!token) return "";
  if (typeof token === "string") return token.replace(/\*\*/g, "").trim();
  if (token.text != null) return String(token.text).replace(/\*\*/g, "").trim();
  if (token.tokens) return token.tokens.map(inlineText).join("");
  return "";
}

function tableToData(token) {
  const headers = token.header.map((c) => inlineText(c));
  const rows = token.rows.map((row) => row.map((c) => inlineText(c)));
  return { headers, rows };
}

/**
 * @returns {{ type: string, ... }[]}
 */
export function parseMarkdownForPdf(markdown) {
  const normalized = normalizeMarkdown(markdown || "");
  const tokens = marked.lexer(normalized);
  const blocks = [];

  for (const token of tokens) {
    switch (token.type) {
      case "heading":
        blocks.push({
          type: "heading",
          level: token.depth,
          text: inlineText(token),
        });
        break;
      case "paragraph":
        blocks.push({ type: "paragraph", text: inlineText(token) });
        break;
      case "table":
        blocks.push({ type: "table", ...tableToData(token) });
        break;
      case "list":
        for (const item of token.items) {
          blocks.push({
            type: "listItem",
            ordered: token.ordered,
            text: inlineText(item),
          });
        }
        break;
      case "blockquote":
        blocks.push({ type: "blockquote", text: inlineText(token) });
        break;
      case "code":
        blocks.push({ type: "code", text: token.text });
        break;
      case "hr":
        blocks.push({ type: "hr" });
        break;
      case "space":
        break;
      default:
        if (token.raw?.trim()) {
          blocks.push({ type: "paragraph", text: token.raw.replace(/\*\*/g, "").trim() });
        }
    }
  }

  return blocks;
}
