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

  // Row breaks before typical table cell starts (Capital letter after pipe)
  text = text.replace(/\|\s+\|(\s*[A-Z])/g, "|\n|$1");

  return text;
}
