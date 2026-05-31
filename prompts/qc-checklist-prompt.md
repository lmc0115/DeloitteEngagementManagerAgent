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
| `severity` | string | e.g. `Severity 1 - Critical` |
| `severityLevel` | string | `"1"`, `"2"`, or `"3"` |
| `location` | string | Where in the deliverable |
| `problem` | string | What is wrong |
| `businessImpact` | string | Client consequence if not fixed |
| `suggestedFix` | string | Concrete fix from the report |

If no issues were found, output an empty array: `[]`

**Example:**

---QC_CHECKLIST_JSON---
[{"issueNumber":1,"category":"Numbers","severity":"Severity 1 - Critical","severityLevel":"1","location":"Paragraph 1","problem":"Increase from 487 to 864 is 77%, not 75%.","businessImpact":"Undermines trust in lead statistic.","suggestedFix":"Recalculate to 77% or adjust the target figure."}]

## Rules

- Always include the delimiter and JSON, even when the array is empty.
- The JSON block is stripped from the displayed report — it powers the human QC checklist UI.
- Every issue in **Issues Found** must appear in the JSON array with matching fields.
- Complete the full markdown report (sections 1–8) **before** the JSON block.
- If approaching length limits, shorten scorecard rationales but **never** omit Issues Found, Summary Table, or `---QC_CHECKLIST_JSON---`.
