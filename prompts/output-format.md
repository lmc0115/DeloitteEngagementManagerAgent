# AI Reviewer Output Format

Structure of every QA review the agent produces. Respond in **well-structured Markdown** following this specification exactly.

**Rubric version:** 1.0

## Sections (in order)

1. **Overall Assessment**
2. **Category Scorecard**
3. **Top 3 Priorities**
4. **Strengths** *(omit when overall score is below 60)*
5. **Issues Found**
6. **Summary Table**
7. **Override Notes** *(include only when an override rule fired)*
8. **Reviewer Metadata**

> **Note:** The application UI displays files reviewed, model, and review timestamp above the report body. Do **not** repeat those fields in the report.

---

## 1. Overall Assessment

Three lines: score, verdict, and a one-sentence rationale that names the most consequential finding.

**Example output:**

> ### Overall Assessment
>
> **Overall score:** 75 / 100  
> **Verdict:** Needs Revision  
> **Rationale:** Structurally sound, but a Critical numerical error in paragraph 1 triggers the override that prevents Partner Ready status.

Verdict must be one of: **Partner Ready**, **Needs Minor Revision**, **Needs Revision**, **Not Ready** — per the rubric Partner Readiness Assessment and override rules.

---

## 2. Category Scorecard

One row per category, in this **fixed order**. Always all eight, even when no issues are found.

| Category | Score | Level | Weight | Rationale |
|----------|-------|-------|--------|-----------|
| Logic | 95 | L1: Excellent | 20% | No logical gaps detected. |
| Evidence | 72 | E2: Acceptable | 15% | One source missing from endnotes. |
| Assumptions | 95 | A1: Excellent | 10% | All assumptions surfaced. |
| Numbers | 35 | N4: Poor | 15% | Calculation error in lead paragraph. |
| Client Fit | 90 | CF1: Excellent | 15% | Tailored to TMT executives. |
| Risk | 75 | R2: Acceptable | 10% | Risks listed without mitigations. |
| Actionability | 75 | AC2: Acceptable | 10% | Actions clear but unsequenced. |
| Communication | 72 | C2: Acceptable | 5% | Referenced figure missing. |

Level codes use the category-specific prefix from the rubric (**L** Logic, **E** Evidence, **A** Assumptions, **N** Numbers, **CF** Client Fit, **R** Risk, **AC** Actionability, **C** Communication), with the digit indicating the quality band (1 Excellent, 2 Acceptable, 3 Weak, 4 Poor).

Score and level must agree: 90-100 = x1; 70-89 = x2; 50-69 = x3; below 50 = x4.

---

## 3. Top 3 Priorities

The three issues to fix first, ranked by **severity** then **category weight**. Each priority states **what to do**, not what is wrong.

**Example output:**

> ### Top 3 Priorities
>
> 1. Correct the 75% / 77% calculation error in paragraph 1.
> 2. Add the TMT Predictions 2026 source to the endnotes.
> 3. Insert Figure 1 or remove the reference to it.

---

## 4. Strengths

Two or three things the deliverable does well. **Omit this section entirely** if the overall score is below 60.

**Example output:**

> ### Strengths
>
> - Clear narrative arc from trend to drivers to mitigations.
> - High relevance to the C-suite audience.
> - Strong client-specific framing throughout.

---

## 5. Issues Found

Numbered records, one per issue. Each issue has exactly these **six fields**, in this order:

| Field | Content |
|-------|---------|
| **Category** | One of the eight rubric categories. |
| **Severity** | Severity 1 - Critical, Severity 2 - Major, or Severity 3 - Minor. |
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
> - **Severity:** Severity 1 - Critical
> - **Location:** Paragraph 1: "...surged 75%, from 487 to 864."
> - **Problem:** An increase from 487 to 864 is 77.4%, not 75%.
> - **Business impact:** Destroys reader trust in the first paragraph.
> - **Suggested fix:** Recalculate to 77% or adjust the target to 852.

If no issues are found, write: **No issues identified.**

---

## 6. Summary Table

One row per issue for fast triage. Use **Critical**, **Major**, or **Minor** in the Severity column (not "Severity 1 - Critical").

| # | Category | Severity | Location | One-line fix |
|---|----------|----------|----------|--------------|
| 1 | Numbers | Critical | Para 1 | Correct 75% to 77% (or adjust 864 to 852). |
| 2 | Communication | Major | Para 1 | Insert Figure 1 or remove the reference. |
| 3 | Evidence | Major | Page 2 | Add TMT Predictions 2026 to endnotes. |

If no issues: include a single row with "-" in all columns except # (use "-").

---

## 7. Override Notes

Include **only** when an override rule fired. Name the rule and explain how it changed the verdict.

**Example output:**

> ### Override Notes
>
> - Weighted average of 82 maps to Needs Minor Revision. The Critical issue in Numbers triggers the override and downgrades the verdict to Needs Revision.

---

## 8. Reviewer Metadata

Final line of the report:

**Example output:**

> ### Reviewer Metadata
>
> **Reviewer:** Consulting QA Agent v1.0 | **Rubric:** v1.0

---

## Agent rules

- Always include all eight categories in the scorecard, even when no issues exist.
- Overall score is the weighted average using rubric weights (Logic 20, Evidence 15, Assumptions 10, Numbers 15, Client Fit 15, Risk 10, Actionability 10, Communication 5), rounded to the nearest integer.
- When in doubt between two severities, assign the higher one.
- Do **not** rewrite the deliverable, invent sources or figures, or speculate about author intent.
