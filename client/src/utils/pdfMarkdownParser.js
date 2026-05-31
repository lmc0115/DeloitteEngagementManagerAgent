import { marked } from "marked";
import { prepareReportMarkdown } from "./prepareReportMarkdown.js";
import { normalizeMarkdown } from "./normalizeMarkdown.js";

marked.setOptions({ gfm: true, breaks: true });

function polishText(text) {
  return String(text || "")
    .replace(/([a-zA-Z)]):([A-Za-z0-9])/g, "$1: $2")
    .replace(/\s+\|\s+/g, " | ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function stripMd(text) {
  return polishText(
    String(text || "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
  );
}

function inlineText(token) {
  if (!token) return "";
  if (typeof token === "string") return stripMd(token);
  if (token.tokens?.length) {
    return polishText(token.tokens.map(inlineText).join(""));
  }
  if (token.text != null) return stripMd(token.text);
  return "";
}

function paragraphLines(node) {
  if (!node.tokens?.length) {
    const text = inlineText(node);
    return text ? [text] : [];
  }

  const lines = [];
  let chunk = [];

  for (const child of node.tokens) {
    if (child.type === "br") {
      const text = inlineText({ tokens: chunk });
      if (text) lines.push(text);
      chunk = [];
      continue;
    }
    chunk.push(child);
  }

  const tail = inlineText({ tokens: chunk });
  if (tail) lines.push(tail);
  return lines;
}

function tableToData(token) {
  const headers = token.header.map((c) => inlineText(c));
  const rows = token.rows.map((row) => row.map((c) => inlineText(c)));
  return { headers, rows };
}

/** Flatten nested blockquote content (headings, lists) into readable plain lines. */
function blockquoteToBlocks(token) {
  const lines = [];

  function walk(node) {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    switch (node.type) {
      case "heading":
        lines.push({ kind: "heading", text: stripMd(inlineText(node)) });
        break;
      case "paragraph":
        for (const line of paragraphLines(node)) {
          lines.push({ kind: "text", text: line });
        }
        break;
      case "list":
        for (const item of node.items) {
          lines.push({ kind: "bullet", text: inlineText(item) });
        }
        break;
      case "blockquote":
        walk(node.tokens);
        break;
      case "space":
        break;
      default:
        if (node.tokens) walk(node.tokens);
        else if (node.text) lines.push({ kind: "text", text: stripMd(node.text) });
        else if (node.raw?.trim()) lines.push({ kind: "text", text: stripMd(node.raw) });
        break;
    }
  }

  walk(token.tokens);

  if (lines.length === 0 && token.text) {
    lines.push({ kind: "text", text: stripMd(token.text) });
  }

  return lines;
}

function tokensToBlocks(tokens) {
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
        blocks.push({
          type: "examplePanel",
          lines: blockquoteToBlocks(token),
        });
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
          blocks.push({ type: "paragraph", text: stripMd(token.raw) });
        }
        break;
    }
  }

  return blocks;
}

/**
 * @returns {{ type: string, ... }[]}
 */
export function parseMarkdownForPdf(markdown, { forReport = false } = {}) {
  const prepared = forReport ? prepareReportMarkdown(markdown || "") : markdown || "";
  const normalized = normalizeMarkdown(prepared);
  const tokens = marked.lexer(normalized);
  return tokensToBlocks(tokens);
}
