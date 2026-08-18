# AI Usage / Disclosure Terms — Clause Checklist

- Disclosure that findings are AI-assisted (extraction, explanation) but
  financial calculations are deterministic, not AI-generated — see
  [ADR-0002](../02-architecture/adr/0002-ai-never-computes-money.md) and
  [ai-policy.md](../06-ai/ai-policy.md)
- Confidence scores are estimates, not guarantees — findings require
  human verification before being treated as fact (ties to the product's
  own [Mistake lifecycle](../02-architecture/data-model.md#mistakes))
- Customer data is not used to train Mistake's general AI models —
  contractual commitment matching
  [data-processing-policy.md](../04-privacy/data-processing-policy.md#customer-data-and-model-training)
- Which third-party model providers are used as subprocessors (link to
  [../08-compliance/subprocessors.md](../08-compliance/subprocessors.md))
- No fully autonomous external actions without human approval — see
  [ai-safety-policy.md](../06-ai/ai-safety-policy.md)
