/**
 * LLMs often emit table rows on a single line: "| a | b | | c | d |"
 * Insert newlines so remark-gfm can parse them.
 */
export function normalizeMarkdown(md) {
  if (!md) return "";

  let text = md;

  // Row breaks before separator rows (|---|)
  text = text.replace(/\|\s+\|(\s*[-:]+)/g, "|\n|$1");

  // Row breaks before numbered issue rows or header cells starting with #
  text = text.replace(/\|\s+\|(\s*[#\d])/g, "|\n|$1");

  // Row breaks before typical table cell starts (Capital letter after pipe).
  // Skip empty first-column headers like "| | Severity 1 — Critical |".
  text = text.replace(/\|\s+\|(\s*[A-Z])/g, (match, letter, offset, str) => {
    const lineStart = str.lastIndexOf("\n", offset) + 1;
    const before = str.slice(lineStart, offset);
    if (/^\|\s*$/.test(before)) return match;
    return `|\n|${letter}`;
  });

  return text;
}
