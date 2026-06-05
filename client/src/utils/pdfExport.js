import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { parseMarkdownForPdf } from "./pdfMarkdownParser.js";
import { parseReportSummary, verdictTone } from "./prepareReportMarkdown.js";

const MARGIN = 18;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_Y = PAGE_HEIGHT - 12;

const COLORS = {
  black: [0, 0, 0],
  charcoal: [29, 29, 29],
  green: [134, 188, 37],
  greenSoft: [238, 246, 224],
  gray100: [245, 245, 245],
  gray300: [208, 208, 206],
  gray500: [117, 120, 123],
  white: [255, 255, 255],
  critical: [196, 18, 48],
  major: [180, 83, 9],
  verdictReady: [45, 106, 18],
  verdictMinor: [180, 83, 9],
  verdictRevision: [194, 65, 12],
};

function stripInlineMd(text) {
  return String(text || "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

const FOOTER_RESERVE = 18;

function ensureSpace(doc, y, needed = 20) {
  if (y + needed > FOOTER_Y - FOOTER_RESERVE) {
    doc.addPage();
    return MARGIN + 8;
  }
  return y;
}

function drawPageFooter(doc, pageNum, totalPages, labels) {
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.gray500);
  doc.setFont(undefined, "normal");
  doc.text(labels.footer(pageNum, totalPages), MARGIN, FOOTER_Y);
  doc.setDrawColor(...COLORS.green);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, FOOTER_Y - 3, PAGE_WIDTH - MARGIN, FOOTER_Y - 3);
}

function applyFootersToAllPages(doc, labels) {
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawPageFooter(doc, p, totalPages, labels);
  }
}

function drawCoverHeader(doc, labels) {
  doc.setFillColor(...COLORS.black);
  doc.rect(0, 0, PAGE_WIDTH, 42, "F");
  doc.setFillColor(...COLORS.green);
  doc.rect(0, 42, PAGE_WIDTH, 2.5, "F");

  doc.setTextColor(...COLORS.green);
  doc.setFontSize(8);
  doc.setFont(undefined, "bold");
  doc.text(labels.coverBrand, MARGIN, 14);

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.text(labels.coverTitle, MARGIN, 26);

  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.setTextColor(200, 200, 200);
  doc.text(labels.coverSub, MARGIN, 34);

  return 52;
}

function addMetaBlock(doc, y, { uploadedFileNames, reportMeta, labels, locale }) {
  doc.setFillColor(...COLORS.gray100);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 22, 2, 2, "F");
  doc.setDrawColor(...COLORS.gray300);
  doc.setLineWidth(0.2);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 22, 2, 2, "S");

  doc.setTextColor(...COLORS.charcoal);
  doc.setFontSize(9);
  doc.setFont(undefined, "normal");

  const dateStr = new Date().toLocaleString(locale);
  let innerY = y + 7;
  doc.text(`${labels.generated} ${dateStr}`, MARGIN + 4, innerY);

  if (uploadedFileNames?.length) {
    innerY += 5;
    const files = doc.splitTextToSize(
      `${labels.filesReviewed} ${uploadedFileNames.join(", ")}`,
      CONTENT_WIDTH - 8
    );
    doc.text(files, MARGIN + 4, innerY);
  }

  if (reportMeta?.model) {
    innerY += 5;
    doc.text(
      `${labels.model}: ${reportMeta.model}  |  ${labels.reviewed}: ${reportMeta.reviewedAt ? new Date(reportMeta.reviewedAt).toLocaleString(locale) : "—"}`,
      MARGIN + 4,
      innerY
    );
  }

  return y + 28;
}

function verdictTextColor(tone) {
  switch (tone) {
    case "ready":
      return COLORS.verdictReady;
    case "minor":
      return COLORS.verdictMinor;
    case "not-ready":
      return COLORS.critical;
    default:
      return COLORS.verdictRevision;
  }
}

function renderReportMetaGrid(doc, y, { reportMeta, labels, locale }) {
  const boxH = 14;
  const gap = 3;
  const colW = (CONTENT_WIDTH - gap) / 2;
  y = ensureSpace(doc, y, boxH * 3 + gap * 2 + 4);

  function drawMetaBox(x, boxY, w, h, label, value) {
    doc.setFillColor(...COLORS.gray100);
    doc.setDrawColor(...COLORS.gray300);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, boxY, w, h, 1.5, 1.5, "FD");

    doc.setFontSize(6.5);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...COLORS.gray500);
    doc.text(String(label).toUpperCase(), x + 2.5, boxY + 4.5);

    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.setTextColor(...COLORS.charcoal);
    const lines = doc.splitTextToSize(String(value), w - 5);
    doc.text(lines.slice(0, 2), x + 2.5, boxY + 9);
  }

  drawMetaBox(MARGIN, y, colW, boxH, labels.model, reportMeta?.model || "—");
  drawMetaBox(
    MARGIN + colW + gap,
    y,
    colW,
    boxH,
    labels.reviewed,
    reportMeta?.reviewedAt ? new Date(reportMeta.reviewedAt).toLocaleString(locale) : "—"
  );

  const row2Y = y + boxH + gap;
  drawMetaBox(
    MARGIN,
    row2Y,
    CONTENT_WIDTH,
    boxH,
    labels.files,
    reportMeta?.fileNames?.join(", ") || "—"
  );

  const row3Y = row2Y + boxH + gap;
  drawMetaBox(MARGIN, row3Y, colW, boxH, labels.rubric, "v1.0");

  return row3Y + boxH + 5;
}

function measureSummaryBarHeight(doc, summary, labels) {
  let height = 16;
  if (summary.rationale) {
    doc.setFontSize(8.5);
    const lines = doc.splitTextToSize(stripInlineMd(summary.rationale), CONTENT_WIDTH - 12);
    height += 4 + lines.length * 4.2;
  }
  return height;
}

function renderReportSummaryBar(doc, y, summary, labels) {
  if (!summary.score && !summary.verdict) return y;

  const barH = measureSummaryBarHeight(doc, summary, labels);
  y = ensureSpace(doc, y, barH + 4);

  doc.setFillColor(...COLORS.greenSoft);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, barH, 2, 2, "F");
  doc.setFillColor(...COLORS.green);
  doc.rect(MARGIN, y, 2.5, barH, "F");
  doc.setDrawColor(...COLORS.gray300);
  doc.setLineWidth(0.2);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, barH, 2, 2, "S");

  let innerY = y + 6;
  const tone = verdictTone(summary.verdict);
  const colW = CONTENT_WIDTH / 2 - 8;

  if (summary.score) {
    doc.setFontSize(6.5);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...COLORS.gray500);
    doc.text(labels.overallScore.toUpperCase(), MARGIN + 6, innerY);

    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...COLORS.charcoal);
    doc.text(stripInlineMd(summary.score), MARGIN + 6, innerY + 5.5);
  }

  if (summary.verdict) {
    doc.setFontSize(6.5);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...COLORS.gray500);
    doc.text(labels.verdictLabel.toUpperCase(), MARGIN + 6 + colW, innerY);

    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...verdictTextColor(tone));
    const verdictLines = doc.splitTextToSize(stripInlineMd(summary.verdict), colW);
    doc.text(verdictLines.slice(0, 2), MARGIN + 6 + colW, innerY + 5.5);
  }

  if (summary.rationale) {
    innerY += 13;
    doc.setDrawColor(...COLORS.gray300);
    doc.line(MARGIN + 6, innerY, MARGIN + CONTENT_WIDTH - 6, innerY);
    innerY += 4;
    doc.setFontSize(8.5);
    doc.setFont(undefined, "normal");
    doc.setTextColor(...COLORS.gray500);
    innerY = addWrappedText(
      doc,
      summary.rationale,
      MARGIN + 6,
      innerY,
      CONTENT_WIDTH - 12,
      4.2,
      { noPageBreak: true }
    );
  }

  return y + barH + 6;
}

function addSectionBanner(doc, y, title, subtitle) {
  y = ensureSpace(doc, y, 18);
  doc.setFillColor(...COLORS.charcoal);
  doc.rect(MARGIN, y, CONTENT_WIDTH, 10, "F");
  doc.setFillColor(...COLORS.green);
  doc.rect(MARGIN, y, 3, 10, "F");

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text(title, MARGIN + 6, y + 6.5);

  if (subtitle) {
    y += 12;
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray500);
    doc.setFont(undefined, "normal");
    doc.text(subtitle, MARGIN, y + 4);
    return y + 8;
  }

  return y + 14;
}

function addWrappedText(doc, text, x, y, maxWidth, lineHeight = 5, { noPageBreak = false } = {}) {
  const lines = doc.splitTextToSize(stripInlineMd(text), maxWidth);
  for (const line of lines) {
    if (!noPageBreak) {
      y = ensureSpace(doc, y, lineHeight + 2);
    }
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

function severityStyle(cellText) {
  const t = cellText.trim();
  if (/^1\b|critical|critique/i.test(t)) return { fillColor: COLORS.critical, textColor: COLORS.white };
  if (/^2\b|major|majeur/i.test(t)) return { fillColor: COLORS.major, textColor: COLORS.white };
  if (/^3\b|minor|mineur/i.test(t)) return { fillColor: COLORS.gray500, textColor: COLORS.white };
  return null;
}

function renderTable(doc, y, { headers, rows }, highlightSeverity = false) {
  y = ensureSpace(doc, y, 30);

  const head = [headers];
  const body = rows.map((row) =>
    row.map((cell) => stripInlineMd(cell))
  );

  const severityCol = headers.findIndex((h) =>
    /severity|gravité|gravite/i.test(h)
  );

  autoTable(doc, {
    startY: y,
    head,
    body,
    margin: { left: MARGIN, right: MARGIN, bottom: FOOTER_RESERVE },
    showFoot: "never",
    tableWidth: CONTENT_WIDTH,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      lineColor: COLORS.gray300,
      lineWidth: 0.2,
      textColor: COLORS.charcoal,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: COLORS.charcoal,
      textColor: COLORS.white,
      fontStyle: "bold",
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: COLORS.gray100,
    },
    columnStyles: headers.reduce((acc, h, i) => {
      if (/definition|fix|problem|location|constat|emplacement|correction/i.test(h)) {
        acc[i] = { cellWidth: "wrap" };
      }
      return acc;
    }, {}),
    didParseCell: (data) => {
      if (
        highlightSeverity &&
        severityCol >= 0 &&
        data.section === "body" &&
        data.column.index === severityCol
      ) {
        const style = severityStyle(data.cell.raw);
        if (style) {
          data.cell.styles.fillColor = style.fillColor;
          data.cell.styles.textColor = style.textColor;
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  return doc.lastAutoTable.finalY + 8;
}

function measurePanelHeight(doc, lines, textWidth) {
  let height = 10;
  for (const line of lines) {
    const fontSize = line.kind === "heading" ? 9.5 : 8.5;
    const lineHeight = line.kind === "heading" ? 4.8 : 4.5;
    doc.setFontSize(fontSize);
    const prefix = line.kind === "bullet" ? "•  " : "";
    const wrapped = doc.splitTextToSize(`${prefix}${line.text}`, textWidth);
    height += wrapped.length * lineHeight + (line.kind === "heading" ? 1 : 0.5);
  }
  return height;
}

function renderExamplePanel(doc, y, lines) {
  if (!lines?.length) return y;

  const panelX = MARGIN;
  const panelPad = 5;
  const textX = panelX + panelPad + 2;
  const textWidth = CONTENT_WIDTH - panelPad * 2 - 4;
  const panelH = measurePanelHeight(doc, lines, textWidth);

  y = ensureSpace(doc, y, panelH);
  const startY = y;

  doc.setFillColor(...COLORS.greenSoft);
  doc.rect(panelX, startY, CONTENT_WIDTH, panelH, "F");
  doc.setFillColor(...COLORS.green);
  doc.rect(panelX, startY, 2, panelH, "F");

  let innerY = startY + panelPad;
  for (const line of lines) {
    if (line.kind === "heading") {
      doc.setFontSize(9.5);
      doc.setFont(undefined, "bold");
      doc.setTextColor(...COLORS.charcoal);
      innerY = addWrappedText(doc, line.text, textX, innerY, textWidth, 4.8, {
        noPageBreak: true,
      });
      innerY += 1;
      doc.setFont(undefined, "normal");
      continue;
    }

    doc.setFontSize(8.5);
    doc.setFont(undefined, "normal");
    doc.setTextColor(...COLORS.charcoal);
    const prefix = line.kind === "bullet" ? "•  " : "";
    innerY = addWrappedText(doc, `${prefix}${line.text}`, textX, innerY, textWidth, 4.5, {
      noPageBreak: true,
    });
    innerY += 0.5;
  }

  return startY + panelH + 4;
}

function renderMarkdownBlocks(doc, y, markdown, options = {}) {
  const blocks = parseMarkdownForPdf(markdown, {
    forReport: options.forReport ?? false,
  });
  const { highlightSeverity = false } = options;

  for (const block of blocks) {
    switch (block.type) {
      case "heading": {
        y = ensureSpace(doc, y, 12);
        const sizes = { 1: 13, 2: 11, 3: 10, 4: 9.5 };
        const size = sizes[block.level] || 10;
        if (block.level <= 2) {
          doc.setDrawColor(...COLORS.green);
          doc.setLineWidth(0.5);
          y += 2;
        }
        doc.setFontSize(size);
        doc.setFont(undefined, "bold");
        doc.setTextColor(...COLORS.charcoal);
        y = addWrappedText(doc, block.text, MARGIN, y, CONTENT_WIDTH, 5.5);
        if (block.level <= 2) {
          doc.line(MARGIN, y, MARGIN + 40, y);
          y += 3;
        }
        doc.setFont(undefined, "normal");
        y += 2;
        break;
      }
      case "table":
        y = renderTable(doc, y, block, highlightSeverity);
        break;
      case "listItem": {
        y = ensureSpace(doc, y, 8);
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.charcoal);
        const lines = doc.splitTextToSize(
          `•  ${stripInlineMd(block.text)}`,
          CONTENT_WIDTH - 6
        );
        for (const line of lines) {
          y = ensureSpace(doc, y, 5);
          doc.text(line, MARGIN + 2, y);
          y += 4.8;
        }
        y += 1;
        break;
      }
      case "examplePanel":
        y = renderExamplePanel(doc, y, block.lines);
        break;
      case "blockquote":
        y = renderExamplePanel(doc, y, [{ kind: "text", text: stripInlineMd(block.text) }]);
        break;
      case "code": {
        y = ensureSpace(doc, y, 12);
        doc.setFillColor(...COLORS.gray100);
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.charcoal);
        const codeLines = doc.splitTextToSize(stripInlineMd(block.text), CONTENT_WIDTH - 10);
        const h = codeLines.length * 4.2 + 6;
        doc.rect(MARGIN, y, CONTENT_WIDTH, h, "F");
        doc.text(codeLines, MARGIN + 4, y + 5);
        y += h + 4;
        break;
      }
      case "paragraph":
        if (block.text) {
          doc.setFontSize(9);
          doc.setTextColor(...COLORS.charcoal);
          y = addWrappedText(doc, block.text, MARGIN, y + 2, CONTENT_WIDTH);
          y += 3;
        }
        break;
      case "hr":
        y = ensureSpace(doc, y, 8);
        doc.setDrawColor(...COLORS.gray300);
        doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
        y += 6;
        break;
      default:
        break;
    }
  }

  return y;
}

function renderChecklist(doc, y, items, labels) {
  y = addSectionBanner(doc, y, labels.sectionChecklist, labels.sectionChecklistSub);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const title = item.category
      ? `${item.category}${item.location ? ` · ${item.location}` : ""}`
      : stripInlineMd(item.text);
    const severity = item.severity ? ` · ${item.severity}` : "";
    const problem = item.problem || stripInlineMd(item.text);
    const fix = item.suggestedFix?.trim();
    const opinion = item.opinion?.trim() || labels.notProvided;

    y = ensureSpace(doc, y, 36);

    doc.setDrawColor(...COLORS.gray300);
    doc.setFillColor(...COLORS.white);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 32, 1.5, 1.5, "FD");

    doc.setFillColor(...COLORS.charcoal);
    doc.roundedRect(MARGIN + 2, y + 2, 7, 7, 1, 1, "F");
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(7);
    doc.setFont(undefined, "bold");
    doc.text(String(i + 1), MARGIN + 4.2, y + 6.8);

    doc.setTextColor(...COLORS.charcoal);
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    const titleLines = doc.splitTextToSize(`${title}${severity}`, CONTENT_WIDTH - 16);
    doc.text(titleLines.slice(0, 1), MARGIN + 12, y + 6);

    doc.setFont(undefined, "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray500);
    const problemLines = doc.splitTextToSize(problem, CONTENT_WIDTH - 14);
    doc.text(problemLines.slice(0, 2), MARGIN + 12, y + 11);

    if (fix) {
      doc.setTextColor(...COLORS.gray500);
      const fixLines = doc.splitTextToSize(`${labels.suggestedFix} ${fix}`, CONTENT_WIDTH - 14);
      doc.text(fixLines.slice(0, 1), MARGIN + 12, y + 19);
    }

    doc.setTextColor(...COLORS.charcoal);
    doc.setFont(undefined, "bold");
    doc.text(labels.humanDecision, MARGIN + 12, y + 25);
    doc.setFont(undefined, "normal");
    doc.setTextColor(...COLORS.gray500);
    const opLines = doc.splitTextToSize(opinion, CONTENT_WIDTH - 38);
    doc.text(opLines.slice(0, 2), MARGIN + 38, y + 25);

    y += 34;
  }

  return y;
}

const DEFAULT_PDF_LABELS = {
  coverBrand: "CONSULTING · QUALITY ASSURANCE",
  coverTitle: "Deliverable QA Package",
  coverSub: "Partner-ready review · Rubric · Report · Checklist",
  generated: "Generated:",
  filesReviewed: "Files reviewed:",
  model: "Model",
  reviewed: "Reviewed",
  files: "Files",
  rubric: "Rubric",
  overallScore: "Overall score",
  verdictLabel: "Verdict",
  sectionRubric: "QA Rubric",
  sectionRubricSub: "Categories, severity levels, and review rules applied to this engagement",
  sectionReport: "AI QA Review Report",
  sectionReportSub: "Issues flagged with severity and suggested fixes",
  sectionChecklist: "Human QC Checklist",
  sectionChecklistSub: "Issues from AI report — human decisions",
  humanDecision: "Human decision:",
  suggestedFix: "Suggested fix:",
  notProvided: "(not provided)",
  footer: (page, total) => `Consulting Deliverable QA Package · Page ${page} of ${total}`,
  filenameParts: { rubric: "rubric", report: "report", checklist: "checklist", export: "export" },
};

export function generatePdf({
  includeRubric,
  includeReport,
  includeChecklist,
  rubricText,
  reportText,
  checklistItems,
  uploadedFileNames,
  reportMeta,
  labels = DEFAULT_PDF_LABELS,
  locale,
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = drawCoverHeader(doc, labels);
  y = addMetaBlock(doc, y, { uploadedFileNames, reportMeta, labels, locale });
  y += 4;

  if (includeRubric && rubricText) {
    y = addSectionBanner(doc, y, labels.sectionRubric, labels.sectionRubricSub);
    y = renderMarkdownBlocks(doc, y, rubricText);
    y += 4;
  }

  if (includeReport && reportText) {
    y = addSectionBanner(doc, y, labels.sectionReport, labels.sectionReportSub);
    if (reportMeta) {
      y = renderReportMetaGrid(doc, y, { reportMeta, labels, locale });
    }
    const summary = parseReportSummary(reportText);
    y = renderReportSummaryBar(doc, y, summary, labels);
    y = renderMarkdownBlocks(doc, y, reportText, {
      highlightSeverity: true,
      forReport: true,
    });
    y += 4;
  }

  if (includeChecklist && checklistItems?.length) {
    y = renderChecklist(doc, y, checklistItems, labels);
  }

  applyFootersToAllPages(doc, labels);

  const parts = labels.filenameParts;
  const filenameParts = [];
  if (includeRubric) filenameParts.push(parts.rubric);
  if (includeReport) filenameParts.push(parts.report);
  if (includeChecklist) filenameParts.push(parts.checklist);
  const filename = `qa-package-${filenameParts.join("-") || parts.export}-${Date.now()}.pdf`;

  doc.save(filename);
}
