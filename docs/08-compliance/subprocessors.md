# Subprocessors

Populate as vendors are actually selected — v1.0 didn't name any, since
infrastructure choices (cloud host, AI model provider, email delivery)
weren't finalized. Template:

| Subprocessor | Purpose | Data categories | Location | DPA in place? |
|---|---|---|---|---|
| **Google Cloud Platform (GCP)** | Infrastructure & DB hosting | All tenant data | Asia-South1 (Mumbai) / US-Central1 | In Progress (Standard Enterprise DPA) |
| **Google Gemini API** (`gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`) | Document fact extraction, OCR, finding explanations | Uploaded document content (zero base-model training) | Global / India Tier | In Progress (Zero-Data-Retention API Agreement) |

| **AWS S3 / GCS** | Original document storage | Uploaded raw business files | Asia-South1 (Mumbai) | In Progress |
| **SendGrid / AWS SES** | Transactional email, invites, MFA OTP | User email, name | Global | In Progress |


This list must be kept current and is what
[subprocessor-policy.md](../04-privacy/subprocessor-policy.md) and any
customer's security questionnaire will reference — don't let it drift
from what's actually deployed.
