# Human QC Checklist (machine-readable — server only)

After **Reviewer Metadata**, output this delimiter on its own line, then a **JSON array** (no code fences) with one object per issue from **Issues Found**.

```
---QC_CHECKLIST_JSON---
```

## JSON schema (one object per issue)

| Field | Type | Description |
|-------|------|-------------|
| `issueNumber` | number | 1, 2, 3… |
| `category` | string | Rubric category |
| `severity` | string | e.g. `Severity 1 – Critical` |
| `severityLevel` | string | `"1"`, `"2"`, or `"3"` |
| `location` | string | Where in the deliverable |
| `problem` | string | What is wrong |
| `businessImpact` | string | Client consequence if not fixed |
| `suggestedFix` | string | Concrete fix from the report |

If no issues were found, output an empty array: `[]`

**Example:**

---QC_CHECKLIST_JSON---
[{"issueNumber":1,"category":"Numbers","severity":"Severity 3 – Minor","severityLevel":"3","location":"Paragraph 1","problem":"Figure qualified as approximate; 77.4% vs 75% is a minor rounding discrepancy.","businessImpact":"No material impact on decision-making.","suggestedFix":"Recalculate to 74.7% or adjust the target to 852."}]

## Rules

- Always include the delimiter and JSON, even when the array is empty.
- The JSON block is stripped from the displayed report — it powers the human QC checklist UI.
- Every issue in **Issues Found** must appear in the JSON array with matching fields.
- Complete the full markdown report (Header through Reviewer Metadata) **before** the JSON block.
- Apply v2 severity rules: approximate/hedged figures → Minor; unsourced or non-credible statistics → Critical; grammatical errors → Minor.
- If approaching length limits, shorten scorecard rationales but **never** omit Issues Found, Summary Table, or `---QC_CHECKLIST_JSON---`.
