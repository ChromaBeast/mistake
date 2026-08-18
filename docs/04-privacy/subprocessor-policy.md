# Subprocessor Policy

## Principle
Any third party that processes tenant data on Mistake's behalf (cloud
hosting, object storage, AI model providers, email delivery, payment
processing) is a subprocessor and must be listed, not silently added.

## Requirements for any new subprocessor
- Data processing agreement in place before data flows to them
- Listed in [../08-compliance/subprocessors.md](../08-compliance/subprocessors.md)
  with purpose and data categories shared
- Existing customers notified per the notice period committed in
  [master-service-agreement.md](../05-legal/master-service-agreement.md)
  before a *new* subprocessor is added (standard SaaS practice — the
  actual notice period is a legal/commercial decision, not specified
  here)

## AI model providers specifically
Confirm each provider's data-retention and training-use terms before
sending any tenant document content to them, and confirm this is
consistent with the training-use policy in
[data-processing-policy.md](./data-processing-policy.md#customer-data-and-model-training).
