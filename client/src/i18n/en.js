export default {
  brandLabel: "Consulting · Quality Assurance",
  title: "Deliverable QA Reviewer",
  lead:
    "LLM quality control for partner-ready mini-decks and memos — scores eight categories, flags issues with severity, and suggests fixes. You decide what to change before review.",
  workflow: [
    "Create deliverable",
    "LLM QA review",
    "Category scorecard",
    "Flag issues",
    "Assign severity",
    "Human decides",
  ],

  upload: {
    title: "Upload deliverables",
    step: "Step 1",
    sub: "Mini-decks or memos — .txt, .md, .pdf, .docx, .xlsx, or .pptx (max 15 MB each, up to 10 files)",
    dragDrop: "Drag and drop files",
    or: "or",
    browse: "Browse files",
    remove: "Remove",
  },

  rubric: {
    title: "QA rubric",
    badge: "Weighted · v1.0",
    expand: "Expand rubric (full screen)",
    sub: "Eight categories scored 0–100 with partner-readiness thresholds. Criteria from prompts/qa-rubric.md; AI output format from prompts/output-format.md (shown at the end — scroll down).",
    loading: "Loading rubric…",
    additionalRequirements: "Additional requirements",
    optional: "optional",
    hint: "Appended to the default rubric for this review only (client context, industry rules, engagement specifics).",
    placeholder:
      "e.g., Verify all figures use FY2024 baseline. Flag any mention of Competitor X without source.",
    modalTitle: "QA rubric & output format",
    modalSub: "Full criteria and AI reviewer output specification (v1.0)",
    close: "Close",
    additionalSection: "Additional requirements",
  },

  cta: {
    filesReady: (n) => `${n} file(s) ready for review`,
    uploadFirst: "Upload at least one deliverable to run QA review",
    runReview: "Run QA review",
    reviewing: "Reviewing…",
  },

  report: {
    title: "QA review report",
    badge: "Scored report · v1.0",
    expand: "Expand report (full screen)",
    model: "Model",
    reviewed: "Reviewed",
    files: "Files",
    rubric: "Rubric",
    overallScore: "Overall score",
    verdict: "Verdict",
    truncationBanner:
      "Report may be incomplete — the model hit its output length limit. Use Expand report (full screen) to scroll, or set a higher GEMINI_MAX_OUTPUT_TOKENS in .env and re-run.",
    analyzing: "Analyzing deliverables",
    analyzingSub:
      "Scoring eight categories, applying override rules, and formatting the review report. This may take up to a minute on the free tier.",
    close: "Close",
  },

  checklist: {
    title: "Human QC checklist",
    badge: "Issues from report",
    sub: "Populated by the AI agent as structured QC checklist items (one per issue). Record whether you will modify as suggested, handle differently, or accept as-is.",
    emptyBefore: "Run QA review first — checklist items will appear here automatically.",
    emptyAfter:
      "No issues were identified in the review report, or the checklist could not be extracted. Re-run the review if you expected flagged issues.",
    businessImpact: "Business impact:",
    suggestedFix: "Suggested fix:",
    humanDecision: "Human decision",
    placeholder:
      "e.g., Modify as suggested · Modify differently because… · Accept as-is · Defer to partner",
    severity: { 1: "Critical", 2: "Major", 3: "Minor" },
  },

  pdf: {
    title: "Export package",
    badge: "PDF download",
    sub: "Build a client-ready PDF with rubric, AI report, and/or checklist. File names are listed on the cover page.",
    includeRubric: "QA rubric (default + additional requirements)",
    includeReport: "AI review report",
    includeChecklist: "Human QC checklist (issues + your decisions)",
    download: "Download PDF",
    alertNoSection: "Select at least one section to include in the PDF.",
    alertNoReport: "Run a review first to include the AI report in the PDF.",
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
    footer: (page, total) =>
      `Consulting Deliverable QA Package · Page ${page} of ${total}`,
    filenameParts: { rubric: "rubric", report: "report", checklist: "checklist", export: "export" },
  },

  errors: {
    uploadRequired: "Please upload at least one deliverable file.",
    reviewFailed: "Review failed",
  },

  lang: {
    label: "Language",
    en: "English",
    fr: "Français",
  },
};
