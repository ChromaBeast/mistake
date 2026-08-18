# Subprocessors

Populate as vendors are actually selected — v1.0 didn't name any, since
infrastructure choices (cloud host, AI model provider, email delivery)
weren't finalized. Template:

| Subprocessor | Purpose | Data categories | Location | DPA in place? |
|---|---|---|---|---|
| _(cloud/hosting provider — TBD, likely GCP per [roadmap.md](../01-product/roadmap.md#month-4--production))_ | Infrastructure hosting | All tenant data | TBD | TBD |
| _(AI model provider — TBD)_ | Extraction, explanation generation | Document content sent for processing | TBD | TBD |
| _(object storage provider — TBD, S3-compatible)_ | Original document storage | Uploaded files | TBD | TBD |
| _(email delivery provider — TBD)_ | Transactional email, invites | Name, email | TBD | TBD |

This list must be kept current and is what
[subprocessor-policy.md](../04-privacy/subprocessor-policy.md) and any
customer's security questionnaire will reference — don't let it drift
from what's actually deployed.
