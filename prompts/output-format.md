# AI Reviewer Output Format

Structure of every QA review the agent produces. Respond in **well-structured Markdown** following this specification exactly.

## Sections (in order)

**Header** → Overall Assessment → Category Scorecard → Top 3 Priorities → Strengths → Issues Found → Summary Table → Override Notes → Reviewer Metadata

- **Strengths** is omitted when the overall score is below 60.
- **Override Notes** appears only when an override rule fired.

---

## Header

Include at the top of every report:

**Example output:**

> **Files reviewed:** sample-memo.docx, appendix.pdf  
> **Model:** Consulting QA Agent | **Reviewed:** 2026/05/31 14:30:00  
> **Rubric version:** 1.0

- **Files reviewed:** list every filename from the deliverables section of the prompt.
- **Model:** use `Consulting QA Agent` unless a specific model identifier is provided in the instructions.
- **Reviewed:** use the review timestamp in `YYYY/MM/DD HH:MM:SS` format.

---

## Overall Assessment

Three lines: score, verdict, and a one-sentence rationale that names the most consequential finding.

**Example output:**

> ### Overall Assessment
>
> **Overall score:** 75 / 100  
> **Verdict:** Needs Revision  
> **Rationale:** Structurally sound, but a Critical numerical error in paragraph 1 triggers the override that prevents Partner Ready status.

Verdict must be one of: **Partner Ready**, **Needs Minor Revision**, **Needs Revision**, **Not Ready** — per the rubric Partner Readiness Assessment and override rules.

---

## Category Scorecard

One row per category, in this **fixed order**. Always all eight, even when no issues are found.

| Category | Score | Level | Weight | Rationale |
|----------|-------|-------|--------|-----------|
| Logic | 95 | L1 – Excellent | 20% | No logical gaps detected. |
| Evidence | 72 | E2 – Acceptable | 15% | One source missing from endnotes. |
| Assumptions | 95 | A1 – Excellent | 10% | All assumptions surfaced. |
| Numbers | 35 | N4 – Poor | 15% | Calculation error in lead paragraph. |
| Client Fit | 90 | CF1 – Excellent | 15% | Tailored to TMT executives. |
| Risk | 75 | R2 – Acceptable | 10% | Risks listed without mitigations. |
| Actionability | 75 | AC2 – Acceptable | 10% | Actions clear but unsequenced. |
| Communication | 72 | C2 – Acceptable | 5% | Referenced figure missing. |

Level codes use the category-specific prefix from the rubric (**L** Logic, **E** Evidence, **A** Assumptions, **N** Numbers, **CF** Client Fit, **R** Risk, **AC** Actionability, **C** Communication), with the digit indicating the quality band (1 Excellent, 2 Acceptable, 3 Weak, 4 Poor).

Score and level must agree: 90–100 → L1/E1/A1 etc.; 70–89 → L2; 50–69 → L3; below 50 → L4.

---

## Top 3 Priorities

The three issues to fix first, ranked by **severity** then **category weight**. Each priority states **what to do**, not what is wrong.

**Example output:**

> ### Top 3 Priorities
>
> 1. Consider aligning the "roughly 75%" figure with the precise 74.7% for polish.
> 2. Add the TMT Predictions 2026 source to the endnotes.
> 3. Insert Figure 1 or remove the reference to it.

---

## Strengths

Two or three things the deliverable does well. **Omit this section entirely** if the overall score is below 60.

**Example output:**

> ### Strengths
>
> - Clear narrative arc from trend to drivers to mitigations.
> - High relevance to the C-suite audience.
> - Strong client-specific framing throughout.

---

## Issues Found

Numbered records, one per issue. Each issue has exactly these **six fields**, in this order:

| Field | Content |
|-------|---------|
| **Category** | One of the eight rubric categories. |
| **Severity** | Severity 1 – Critical, Severity 2 – Major, or Severity 3 – Minor. |
| **Location** | Page, slide, section, or paragraph reference. Quote a short string when useful. |
| **Problem** | One to three sentences explaining what is wrong. |
| **Business impact** | One sentence on the consequence for the client if not fixed. |
| **Suggested fix** | One concrete revision the human can apply or reject. |

**Example output:**

> ### Issues Found
>
> #### Issue 1
>
> - **Category:** Numbers
> - **Severity:** Severity 3 – Minor
> - **Location:** Paragraph 1: "...surged 75%, from 487 to 864."
> - **Problem:** The figure is qualified as approximate ("roughly 864"), so the 77.4% vs 75% difference is a minor rounding discrepancy, not an error that changes the recommendation.
> - **Business impact:** No material impact on decision-making; reviewer should note it for polish.
> - **Suggested fix:** Recalculate to 74.7% or adjust the target to 852.

If no issues are found, write: **No issues identified.**

---

## Summary Table

One row per issue for fast triage. Use **Critical**, **Major**, or **Minor** in the Severity column (not "Severity 1 – Critical"). Severity cells are color-coded by level in the application UI.

| # | Category | Severity | Location | One-line fix |
|---|----------|----------|----------|--------------|
| 1 | Numbers | Minor | Para 1 | Consider aligning "roughly 75%" with the precise 74.7% for polish. |
| 2 | Communication | Major | Para 1 | Insert Figure 1 or remove the reference. |
| 3 | Evidence | Major | Page 2 | Add TMT Predictions 2026 to endnotes. |

If no issues: include a single row with "-" in all columns except # (use "-").

---

## Override Notes

Include **only** when an override rule fired. Name the rule and explain how it changed the verdict.

**Example output (override fired):**

> ### Override Notes
>
> - Weighted average of 82 maps to Needs Minor Revision. The Critical issue in Numbers triggers the override and downgrades the verdict to Needs Revision.

**Example output (no override):**

> ### Override Notes
>
> - No override fired in this example. The Numbers issue is Severity 3 – Minor (hedged approximation), so the override rule does not apply.

When no override fired, you may omit this section entirely.

---

## Reviewer Metadata

Final line of the report:

**Example output:**

> ### Reviewer Metadata
>
> **Reviewer:** Consulting QA Agent v1.0 | **Rubric:** v1.0 | **Run:** 2026-05-31T14:30:00Z

---

## Agent rules

- Always include all eight categories in the scorecard, even when no issues exist.
- Score and level must agree: 90–100 → L1/E1/A1 etc.; 70–89 → L2; 50–69 → L3; below 50 → L4.
- Overall score is the weighted average using rubric weights (Logic 20, Evidence 15, Assumptions 10, Numbers 15, Client Fit 15, Risk 10, Actionability 10, Communication 5), rounded to the nearest integer.
- When in doubt between two severities, assign the **higher** one.
- Do **not** rewrite the deliverable, invent sources or figures, or speculate about author intent.
- Rounding differences on figures explicitly qualified as approximate (e.g., "roughly," "approximately") are **Severity 3 – Minor**, never Critical.
- A numerical value or statistic with **no source**, or whose cited source does not contain it or is not credible, is **Severity 1 – Critical**.
- Grammatical errors are **Severity 3 – Minor**.
