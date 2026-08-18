# Data Processing Policy

## What data Mistake processes
Uploaded business records (CSV, XLSX, PDF, email exports, ERP exports)
containing customer, supplier, product, order, purchase order, invoice,
payment, and shipment information — see
[data-model.md](../02-architecture/data-model.md). This may incidentally
include personal data of individuals named in those records (contact
names in POs/invoices, email senders) even though the product's purpose
is business-record reconciliation, not people-tracking.

## Purpose of processing
Extraction, entity resolution, contradiction detection, and financial
impact calculation for the uploading tenant's own operational use. Data
is not repurposed beyond this without the tenant's explicit instruction.

## Customer data and model training
**Default policy: customer data is not used to train Mistake's general
AI models.** This must be represented both technically (data
segregation between tenant processing and any model fine-tuning
pipeline) and contractually (see
[ai-terms.md](../05-legal/ai-terms.md)).

## Subprocessors
See [subprocessor-policy.md](./subprocessor-policy.md) and the tracked
list in [../08-compliance/subprocessors.md](../08-compliance/subprocessors.md).
