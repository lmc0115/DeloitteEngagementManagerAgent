# Consulting Workbook QA Rubric (Spreadsheet / Model Deliverables)

## Review Categories

The AI Quality Assurance Reviewer evaluates consulting spreadsheet and model deliverables across eight dimensions. Each category receives a score from 0–100 and contributes to the overall Partner Readiness Assessment.

| Category | Code | Weight |
|----------|------|--------|
| Formulas | FM | 20% |
| Analysis | AN | 20% |
| Sources | SR | 15% |
| Assumptions | AS | 10% |
| Consistency | CN | 10% |
| Sensitivity | SV | 10% |
| Insight | IN | 10% |
| Structure | ST | 5% |
| **Total** | — | **100%** |

---

## Formulas (FM)

### Definition

Formulas evaluates whether calculations are mechanically correct, free of error values, and built with sound formula construction rather than hardcoded overrides.

### Scoring Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| FM1 – Excellent | 90–100 | All formulas compute correctly with no error values; calculations reference input cells rather than hardcoded numbers throughout. |
| FM2 – Acceptable | 70–89 | Calculations are correct; isolated error values or hardcoded overrides exist but do not affect outputs. |
| FM3 – Weak | 50–69 | Multiple formula errors or hardcoded values embedded in calculation cells; some outputs require verification. |
| FM4 – Poor | <50 | Calculation errors or broken references materially affect outputs. |

### LLM Detection Rules

Flag a Formulas issue when:

- Cells contain error values (#REF!, #DIV/0!, #N/A, #VALUE!, #NAME?).
- Hardcoded numbers are embedded within calculation formulas rather than held in input cells.
- A formula references the wrong cell, range, or sheet.
- Logical or lookup functions return unintended results (e.g., approximate-match lookup on unsorted data).

---

## Analysis (AN)

### Definition

Analysis evaluates whether the conclusions drawn from the spreadsheet are valid, well-reasoned, and directly supported by the underlying calculations and data.

### Scoring Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| AN1 – Excellent | 90–100 | Conclusions follow directly from the data; reasoning is sound and no logical inconsistencies exist. |
| AN2 – Acceptable | 70–89 | Conclusions are generally supported; minor gaps in reasoning exist but do not undermine the overall finding. |
| AN3 – Weak | 50–69 | Conclusions are only partially supported by the data; significant reasoning gaps are present. |
| AN4 – Poor | <50 | Conclusions contradict or are unsupported by the underlying data and outputs. |

### LLM Detection Rules

Flag an Analysis issue when:

- A conclusion is stated that is not supported by the model outputs.
- The analytical method chosen is inappropriate for the question being answered.
- Cause-and-effect relationships are asserted but not demonstrated by the data.
- Findings in one section contradict findings in another.

---

## Sources (SR)

### Definition

Sources evaluates whether inputs, benchmarks, and claims embedded in the workbook are supported by credible, current, and traceable references.

### Scoring Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| SR1 – Excellent | 90–100 | All material inputs and benchmarks are sourced; sources are credible and current. |
| SR2 – Acceptable | 70–89 | Most inputs are sourced; minor unsourced assertions are present but do not affect conclusions. |
| SR3 – Weak | 50–69 | Multiple material inputs lack sources; references are thin, vague, or outdated. |
| SR4 – Poor | <50 | Key inputs are presented without any cited source. |

### LLM Detection Rules

Flag a Sources issue when:

- A material input or benchmark appears with no cited source.
- A source note references a document or page that cannot be located.
- Cited data is outdated relative to the scope of the analysis.
- A market or industry figure is stated without attribution.

---

## Assumptions (AS)

### Definition

Assumptions evaluates whether key driver assumptions are explicitly stated, isolated from calculations, and reasonable within the context of the analysis.

### Scoring Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| AS1 – Excellent | 90–100 | All material assumptions are explicitly stated, isolated in dedicated input cells, and justified. |
| AS2 – Acceptable | 70–89 | Most assumptions are identifiable; some are only partially justified or not fully isolated. |
| AS3 – Weak | 50–69 | Several assumptions remain implicit or are embedded within calculation cells. |
| AS4 – Poor | <50 | Critical assumptions are missing or cannot be identified. |

### LLM Detection Rules

Flag an Assumptions issue when:

- Outputs depend on assumptions that are nowhere stated.
- Input values are embedded inside formulas rather than held in distinct cells.
- An assumption conflicts with available evidence or the client context.
- Growth rates, multiples, or rates appear without justification.

---

## Consistency (CN)

### Definition

Consistency evaluates whether figures reconcile internally: totals tie to their components, cross-sheet references agree, and units, periods, and signs are applied uniformly.

### Scoring Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| CN1 – Excellent | 90–100 | All totals reconcile; cross-sheet references agree; units, periods, and signs are consistent throughout. |
| CN2 – Acceptable | 70–89 | Minor rounding differences only; no impact on conclusions. |
| CN3 – Weak | 50–69 | Multiple inconsistencies between sheets or sections require verification. |
| CN4 – Poor | <50 | Figures fail to reconcile in ways that materially affect conclusions. |

### LLM Detection Rules

Flag a Consistency issue when:

- Subtotals or totals do not sum to their components.
- The same metric carries different values across sheets or sections.
- Units or currencies are mixed without conversion.
- Time periods are inconsistent (e.g., monthly figures rolled into an annual line incorrectly).
- Signs are inconsistent (costs positive in one place, negative in another).

---

## Sensitivity (SV)

### Definition

Sensitivity evaluates whether key drivers are flexible and whether the workbook tests how outputs respond to changes in material assumptions.

### Scoring Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| SV1 – Excellent | 90–100 | Key drivers are adjustable and sensitivity or scenario analysis demonstrates output ranges. |
| SV2 – Acceptable | 70–89 | Drivers are adjustable; sensitivity analysis is present but does not cover all material drivers. |
| SV3 – Weak | 50–69 | Limited flexibility; sensitivity is addressed superficially or for only minor drivers. |
| SV4 – Poor | <50 | Drivers are fixed; no sensitivity or scenario analysis is present. |

### LLM Detection Rules

Flag a Sensitivity issue when:

- Conclusions rest on a single point estimate with no range tested.
- Key drivers cannot be changed without rewriting formulas.
- No scenario, data table, or sensitivity output exists for material drivers.
- A volatile assumption is presented as if it were certain.

---

## Insight (IN)

### Definition

Insight evaluates whether the workbook's outputs translate into a clear, actionable recommendation with defined next steps, owners, and timelines.

### Scoring Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| IN1 – Excellent | 90–100 | Outputs lead to a clear recommendation with specific next steps, defined owners, and timelines. |
| IN2 – Acceptable | 70–89 | A recommendation is present; next steps are partially defined. |
| IN3 – Weak | 50–69 | Outputs are present but the path to a recommendation or action is unclear. |
| IN4 – Poor | <50 | No recommendation or actionable next step is derived from the analysis. |

### LLM Detection Rules

Flag an Insight issue when:

- The workbook produces outputs but no recommendation or headline finding.
- Next steps are absent or not linked to the analysis.
- No owner or timeline is identified for recommended actions.
- The recommendation does not reflect the client's context or constraints.

---

## Structure (ST)

### Definition

Structure evaluates whether the workbook is organized logically, follows formatting conventions, and can be reviewed by a third party without the author present.

### Scoring Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| ST1 – Excellent | 90–100 | Inputs, calculations, and outputs are clearly separated; tabs are logically named and sequenced; formatting is consistent. |
| ST2 – Acceptable | 70–89 | Structure is generally clear with minor mixing of layers or formatting inconsistencies. |
| ST3 – Weak | 50–69 | Layers are mixed; tab organization or formatting is inconsistent. |
| ST4 – Poor | <50 | No discernible structure; inputs, calculations, and outputs are interleaved arbitrarily. |

### LLM Detection Rules

Flag a Structure issue when:

- Inputs, calculations, and outputs share the same region without distinction.
- Tab names are generic, duplicated, or non-descriptive (e.g., Sheet1, Sheet2).
- Number formats, fonts, or colours are inconsistent across tabs.

---

## Severity Classification Framework

Issue severity is assessed independently from category scores. A workbook may achieve a high overall score while still containing critical issues requiring immediate correction.

| Criterion | Severity 1 – Critical | Severity 2 – Major | Severity 3 – Minor |
|-----------|------------------------|--------------------|--------------------|
| Definition | Changes or invalidates the recommendation or business decision. | Does not invalidate the recommendation but significantly weakens confidence in it. | Affects clarity or professionalism without affecting the recommendation. |
| Business Impact | Client could make an incorrect decision if not resolved. | Recommendation requires revision before partner review. | No material impact on decision-making. |
| Priority | Fix Immediately | Fix Before Partner Review | Improve When Convenient |
| Examples | Formula error in a primary output cell. Conclusion contradicts model outputs. Key assumption embedded with no label. Uncited material input. | Sensitivity analysis absent for a volatile driver. Unsourced market benchmark. Cross-sheet reference disagreement. | Minor formatting inconsistencies. Generic tab names on non-critical sheets. Rounding on intermediate calculations. |

When in doubt between two severities, assign the **higher** one.

---

## Partner Readiness Assessment

The overall score is calculated using the weighted category scores.

| Overall Score | Assessment |
|---------------|------------|
| 90–100 | Partner Ready |
| 75–89 | Needs Minor Revision |
| 60–74 | Needs Revision |
| Below 60 | Not Ready |

### Override Rules

- Any Critical issue automatically removes Partner Ready status.
- Three or more Major issues prevent a rating above Needs Revision.
- Five or more Major issues result in a Not Ready classification.
