# Integration Specification

## MVP: file-based ingestion only

No live integration is required for a customer to get value — this is a
deliberate product bet (see
[PRD.md § What Mistake does](../01-product/PRD.md#2-what-mistake-does)).
Supported inputs:

| Format | Extraction approach |
|---|---|
| CSV | Structured parse, header-mapping (fuzzy match against known field names, human-confirm on ambiguity) |
| XLSX | Structured parse per sheet; multi-sheet workbooks processed sheet-by-sheet with sheet name as `source_location` |
| PDF | OCR/text extraction → AI extraction pipeline (see [AI routing](../06-ai/ai-policy.md#routing)) for tables and free text |
| Email export (.eml / .mbox) | Header + body parse; attachments processed by their own type |
| ERP export | Treated as CSV/XLSX with a configurable field-mapping profile per common ERP export shape (Tally, Zoho Books, SAP Business One flat exports, etc. — confirm actual target ERPs with sales before building mapping profiles, since building for the wrong ERP wastes the effort) |
| Manual upload | Any of the above, uploaded by a user rather than pulled by a connector |

All five (six, counting manual) go through the same pipeline:
`Upload → Classify → Parse/Extract → Entity Resolution → Event Creation`
— see [data-model.md](./data-model.md) and
[event-model.md](./event-model.md).

## Deferred: live integrations

Not built for MVP; sequenced by validated pilot demand, not by default
roadmap momentum (see
[roadmap.md § Future expansion](../01-product/roadmap.md#future-expansion)):

- **ERP connectors** (read-only first; write-back is explicitly out of
  scope even post-MVP until trust is established — see
  [PRD.md § MVP non-goals](../01-product/PRD.md))
- **Accounting connectors** (Tally, Zoho Books, QuickBooks — candidates,
  not commitments)
- **WhatsApp Business API** — high customer-visible value (WhatsApp is
  where a lot of the informal quantity/price changes happen per the
  [problem statement](../01-product/PRD.md#1-problem)) but requires
  Meta approval, template message constraints, and a data-handling
  review before committing engineering time
- **Email integration** (IMAP/Graph API pull instead of manual export)

## Integration decision criteria

Before building any live connector, confirm:
1. At least 3 pilot customers have explicitly asked for this specific
   system (not "an integration," a named system)
2. The manual-export flow is measurably a retention or activation
   blocker for those customers, not just a convenience request
3. The connector doesn't require write access to the source system (read
   only, until the write-back non-goal is revisited deliberately)

This list didn't exist in v1.0 — added so "which integration next" isn't
decided by whoever asks loudest.
