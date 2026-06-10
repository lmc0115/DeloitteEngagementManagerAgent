# AI Reviewer Output Format — Presentation (PPTX) Deliverables

Structure of every QA review the agent produces for slide-deck deliverables. Respond in **well-structured Markdown** following this specification exactly.

## Sections (in order)

**Header** → Overall Assessment → Category Scorecard → Top 3 Priorities → Strengths → Issues Found → Summary Table → Override Notes → Reviewer Metadata

- **Strengths** is omitted when the overall score is below 60.
- **Override Notes** appears only when an override rule fired.

---

## Header

Include at the top of every report:

**Example output:**

> **Files reviewed:** deck.pptx
> **Model:** Consulting QA Agent | **Reviewed:** 2026/05/31 14:30:00
> **Rubric version:** Presentation 1.0

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
> **Rationale:** The story is clear, but a chart on slide 6 contradicts its headline, a Critical issue that triggers the override and prevents Partner Ready status.

Verdict must be one of: **Partner Ready**, **Needs Minor Revision**, **Needs Revision**, **Not Ready** — per the rubric Partner Readiness Assessment and override rules.

---

## Category Scorecard

One row per category, in this **fixed order**. Always all six, even when no issues are found.

| Category | Score | Level | Weight | Rationale |
|----------|-------|-------|--------|-----------|
| Slide Message Clarity | 95 | SM1 – Excellent | 20% | Headlines state conclusions throughout. |
| Narrative and Flow | 72 | NF2 – Acceptable | 20% | One abrupt transition before the recommendation. |
| Data and Visual Accuracy | 35 | DV4 – Poor | 20% | Chart on slide 6 contradicts its headline. |
| Evidence and Support | 70 | ES2 – Acceptable | 25% | One quantitative claim lacks a source. |
| Client Fit and Actionability | 80 | CA2 – Acceptable | 10% | Recommendations fit; owners partially defined. |
| Slide Craft | 75 | SC2 – Acceptable | 5% | A few text-heavy slides. |

Level codes use the category-specific prefix from the rubric (**SM** Slide Message Clarity, **NF** Narrative and Flow, **DV** Data and Visual Accuracy, **ES** Evidence and Support, **CA** Client Fit and Actionability, **SC** Slide Craft), with the digit indicating the quality band (1 Excellent, 2 Acceptable, 3 Weak, 4 Poor).

Score and level must agree: 90–100 → SM1/NF1 etc.; 70–89 → x2; 50–69 → x3; below 50 → x4.

---

## Top 3 Priorities

The three issues to fix first, ranked by **severity** then **category weight**. Each priority states **what to do**, not what is wrong.

**Example output:**

> ### Top 3 Priorities
>
> 1. Correct the slide 6 chart so it matches the "Revenue is Growing" headline.
> 2. Add a cited source for the 30% market-share claim on slide 9.
> 3. Smooth the transition into the recommendation on slide 11.

---

## Strengths

Two or three things the deliverable does well. **Omit this section entirely** if the overall score is below 60.

**Example output:**

> ### Strengths
>
> - Headlines consistently state conclusions, not topics.
> - Clear opening problem statement and closing recommendation.
> - Concise, well-formatted slides throughout.

---

## Issues Found

Numbered records, one per issue. Each issue has exactly these **six fields**, in this order:

| Field | Content |
|-------|---------|
| **Category** | One of the six rubric categories. |
| **Severity** | Severity 1 – Critical, Severity 2 – Major, or Severity 3 – Minor. |
| **Location** | Slide number (and a short quoted string when useful), e.g., "Slide 6". |
| **Problem** | One to three sentences explaining what is wrong. |
| **Business impact** | One sentence on the consequence for the client if not fixed. |
| **Suggested fix** | One concrete revision the human can apply or reject. |

**Example output:**

> ### Issues Found
>
> #### Issue 1
>
> - **Category:** Data and Visual Accuracy
> - **Severity:** Severity 1 – Critical
> - **Location:** Slide 6: "Revenue is Growing"
> - **Problem:** The headline claims growth, but the bar chart shows revenue declining year over year.
> - **Business impact:** The client could draw the opposite conclusion from the data and approve the wrong strategy.
> - **Suggested fix:** Correct the chart data or revise the headline to match the actual trend.

If no issues are found, write: **No issues identified.**

---

## Summary Table

One row per issue for fast triage. Use **Critical**, **Major**, or **Minor** in the Severity column (not "Severity 1 – Critical"). Severity cells are color-coded by level in the application UI.

| # | Category | Severity | Location | One-line fix |
|---|----------|----------|----------|--------------|
| 1 | Data and Visual Accuracy | Critical | Slide 6 | Align the chart with its "Revenue is Growing" headline. |
| 2 | Evidence and Support | Major | Slide 9 | Add a source for the 30% market-share claim. |
| 3 | Narrative and Flow | Minor | Slide 11 | Smooth the transition into the recommendation. |

If no issues: include a single row with "-" in all columns except # (use "-").

---

## Override Notes

Include **only** when an override rule fired. Name the rule and explain how it changed the verdict.

**Example output (override fired):**

> ### Override Notes
>
> - Weighted average of 78 maps to Needs Minor Revision. The Critical chart-versus-headline contradiction on slide 6 triggers the override and downgrades the verdict to Needs Revision.

When no override fired, you may omit this section entirely.

---

## Reviewer Metadata

Final line of the report:

**Example output:**

> ### Reviewer Metadata
>
> **Reviewer:** Consulting QA Agent | **Rubric:** Presentation v1.0 | **Run:** 2026-05-31T14:30:00Z

---

## Agent rules

- Always include all six categories in the scorecard, even when no issues exist.
- Score and level must agree: 90–100 → x1; 70–89 → x2; 50–69 → x3; below 50 → x4.
- Overall score is the weighted average using rubric weights (Slide Message Clarity 20, Narrative and Flow 20, Data and Visual Accuracy 20, Evidence and Support 25, Client Fit and Actionability 10, Slide Craft 5), rounded to the nearest integer.
- When in doubt between two severities, assign the **higher** one.
- Do **not** rewrite the deliverable, invent sources or figures, or speculate about author intent.
- Reference specific content — slide numbers, headlines, or chart titles — in every issue. Generic observations are not acceptable.
- A chart that contradicts its slide headline, or an uncited quantitative claim, is **Severity 1 – Critical**.
- Rounding differences on figures explicitly qualified as approximate, grammatical errors, and minor formatting inconsistencies are **Severity 3 – Minor**, never Critical.
