# DPDP Compliance Notes

**This is a working checklist for engineering/product, not a legal
compliance determination.** Applicability and implementation must be
verified against Mistake's actual operating model with qualified legal
counsel before external claims of compliance are made — v1.0 said this
and it's carried forward unchanged because it's still true.

## What the product should already support, mapped to likely DPDP-relevant needs
- Purpose limitation → [data-processing-policy.md](./data-processing-policy.md)
- Storage limitation / retention → [data-retention-policy.md](./data-retention-policy.md)
- Real deletion capability → [deletion-policy.md](./deletion-policy.md)
- Access, correction, deletion workflows for a data principal →
  Privacy Center, see [privacy-policy.md](./privacy-policy.md)
- Security safeguards → [../03-security](../03-security)
- Subprocessor tracking → [subprocessor-policy.md](./subprocessor-policy.md)
- Breach/incident handling → [../03-security/incident-response-plan.md](../03-security/incident-response-plan.md)

## Open items requiring legal counsel (not resolved by this doc set)
- Whether Mistake is a Data Fiduciary, Data Processor, or both depending
  on tenant relationship, and what that means for each tenant's own DPDP
  obligations to *their* customers whose data flows through Mistake
- Applicable CERT-In incident reporting timelines and format
- Consent Manager applicability, if any, given B2B (not direct consumer)
  data flows
- Cross-border data transfer restrictions if any infrastructure or
  subprocessor is outside India

## Do not
Do not state or imply "DPDP compliant" anywhere in product marketing or
customer-facing material until legal counsel has signed off on a
completed compliance matrix (see
[../08-compliance/compliance-matrix.md](../08-compliance/compliance-matrix.md)).
