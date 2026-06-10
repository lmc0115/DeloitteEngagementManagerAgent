# Consulting Presentation QA Rubric (Slide Deck Deliverables)

## Review Categories

The AI Quality Assurance Reviewer evaluates consulting presentations across six dimensions. Each category receives a score from 0–100 and contributes to the overall Partner Readiness Assessment.

| Category | Code | Weight |
|----------|------|--------|
| Slide Message Clarity | SM | 20% |
| Narrative and Flow | NF | 20% |
| Data and Visual Accuracy | DV | 20% |
| Evidence and Support | ES | 25% |
| Client Fit and Actionability | CA | 10% |
| Slide Craft | SC | 5% |
| **Total** | — | **100%** |

---

## Slide Message Clarity (SM)

### Definition

Evaluates whether each slide communicates a single, explicit conclusion. Scored across message specificity (headline states a conclusion rather than a topic) and single-point focus (one primary finding per slide), weighted equally.

### Scoring Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| SM1 – Excellent | 90–100 | All headlines state explicit conclusions. Body content reinforces the headline directly. |
| SM2 – Acceptable | 70–89 | Most headlines state conclusions. A few slides present topics rather than conclusions. |
| SM3 – Weak | 50–69 | Several slides lack clear messages. The audience must infer the point from body content. |
| SM4 – Poor | <50 | Most slides present topics or raw data without a stated conclusion. |

### LLM Detection Rules

Flag a Slide Message Clarity issue when:

- Slide title describes a topic rather than stating a conclusion (e.g., "Market Overview" vs. "Market is Contracting").
- Multiple distinct points compete for attention on a single slide.
- Key insight appears only in body text and is absent from the slide title.

---

## Narrative and Flow (NF)

### Definition

Evaluates whether the slide sequence builds a coherent argument from beginning to end. Scored across logical sequencing of slides and clarity of transitions between them, weighted equally.

### Scoring Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| NF1 – Excellent | 90–100 | Clear argumentative structure throughout. Each slide sets up the next. Story is self-contained. |
| NF2 – Acceptable | 70–89 | Overall story is evident. A few transitions are abrupt or slides appear slightly out of sequence. |
| NF3 – Weak | 50–69 | No clear through-line. Slides are organized by topic rather than by argument. |
| NF4 – Poor | <50 | No discernible narrative structure. Slides appear in arbitrary or contradictory order. |

### LLM Detection Rules

Flag a Narrative and Flow issue when:

- The deck has no identifiable opening problem statement or closing recommendation.
- The final slide does not resolve or respond to the argument opened in the first few slides.
- Appendix material appears in the main flow without a transition or explanation.

---

## Data and Visual Accuracy (DV)

### Definition

Evaluates whether charts, graphs, and tables accurately represent the underlying data. Scored across numerical accuracy of values and calculations and visual integrity (axes labelled, scales not misleading, data cited), weighted equally.

### Scoring Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| DV1 – Excellent | 90–100 | All charts accurate. Axes labelled with units. Data sources cited. No misleading visual choices. |
| DV2 – Acceptable | 70–89 | Minor labelling gaps. No material misrepresentation of data. |
| DV3 – Weak | 50–69 | Multiple labelling gaps or inconsistencies. Visual choices obscure or distort data. |
| DV4 – Poor | <50 | Charts contain calculation errors, missing sources, or visually mislead the reader. |

### LLM Detection Rules

Flag a Data and Visual Accuracy issue when:

- Chart axes are missing labels or units.
- The stated slide conclusion does not match the data shown in the accompanying chart.
- The same metric is presented with different values across two or more slides.

---

## Evidence and Support (ES)

### Definition

Evaluates whether claims, findings, and recommendations are supported by data, research, benchmarks, or cited analysis. Scored across presence of supporting evidence for material claims and credibility and currency of sources, weighted equally.

### Scoring Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| ES1 – Excellent | 90–100 | All material claims supported. Sources are credible and current. |
| ES2 – Acceptable | 70–89 | Most claims supported. Minor unsupported assertions present. |
| ES3 – Weak | 50–69 | Multiple unsupported claims. Supporting evidence is thin, vague, or not cited. |
| ES4 – Poor | <50 | Conclusions and recommendations are presented without supporting evidence. |

### LLM Detection Rules

Flag an Evidence and Support issue when:

- A quantitative claim is stated without a cited source.
- A statement such as "our analysis shows" is used without referencing specific data or methodology.
- Evidence cited is from a non-credible source or is outdated relative to the scope of the analysis.

---

## Client Fit and Actionability (CA)

### Definition

Evaluates whether recommendations are tailored to the client's context, constraints, and stated objectives, and whether they translate into concrete actions with defined owners and timelines. Scored across tailoring to client context and actionability of recommendations, weighted equally.

### Scoring Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| CA1 – Excellent | 90–100 | Recommendations are specific to the client. Next steps have defined owners and timelines. |
| CA2 – Acceptable | 70–89 | Recommendations generally fit the client. Some generic elements. Next steps partially defined. |
| CA3 – Weak | 50–69 | Recommendations largely generic. Limited tailoring. Implementation detail absent or superficial. |
| CA4 – Poor | <50 | Generic or unrealistic recommendations. No actionable next steps identified. |

### LLM Detection Rules

Flag a Client Fit and Actionability issue when:

- Recommendations use generic language that could apply to any organization in any industry.
- Client-specific constraints, priorities, or objectives stated in the deck are not reflected in the recommendations.
- No next steps, owners, or timelines are identified on the recommendations slide.

---

## Slide Craft (SC)

### Definition

Evaluates text density, visual hierarchy, and professional polish. Scored across text economy and visual hierarchy per slide and consistency and professionalism of formatting throughout the deck, weighted equally.

### Scoring Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| SC1 – Excellent | 90–100 | Slides are clean and visually organized. Text is concise. Formatting consistent throughout. |
| SC2 – Acceptable | 70–89 | Generally well formatted. Minor density or consistency issues on a small number of slides. |
| SC3 – Weak | 50–69 | Several slides are text-heavy or disorganized. Formatting inconsistent across the deck. |
| SC4 – Poor | <50 | Slides consistently dense or visually difficult to parse at a glance. |

### LLM Detection Rules

Flag a Slide Craft issue when:

- A slide contains more than 50 words of body text in prose form.
- Multiple font sizes, colours, or text styles are used inconsistently across slides.
- Grammatical or spelling errors are present.

---

## Severity Classification Framework

Issue severity is assessed independently from category scores. A deliverable may achieve a high overall score while still containing critical issues requiring immediate correction.

| Criterion | Severity 1 – Critical | Severity 2 – Major | Severity 3 – Minor |
|-----------|------------------------|--------------------|--------------------|
| Definition | Changes or invalidates the recommendation or business decision. | Does not invalidate the recommendation but significantly weakens confidence in it. | Affects clarity or professionalism without affecting the recommendation. |
| Business Impact | Client could make an incorrect decision if not resolved. | Recommendation requires revision before partner review. | No material impact on decision-making. |
| Priority | Fix Immediately | Fix Before Partner Review | Improve When Convenient |
| Examples | Chart contradicts headline. Uncited quantitative claim. Recommendation conflicts with stated client objective. | Slide sequence lacks logical progression. Generic recommendations. Next steps absent. | Rounding on approximate figures. Grammatical errors. Minor formatting inconsistencies. |

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
