# Prompt Security

## Uploaded documents are untrusted content

```
UNTRUSTED DATA → Parser → Sanitizer → Content Classification → LLM
```

The LLM should not automatically have database, filesystem, email,
payment, or ERP access unless exposed through explicit, tightly
controlled tools scoped per [ai-safety-policy.md](./ai-safety-policy.md).

## Specific risks for Mistake
Since the product's core function is processing uploaded business
documents, a malicious or compromised upload is a realistic threat
vector, not a theoretical one — e.g. a PDF crafted with hidden text
instructing the extraction model to report false entities, alter
confidence scores, or fabricate evidence. Defenses:

- Sanitization/classification pass before any document content reaches
  the LLM (see pipeline above)
- Deterministic engine never trusts AI-extracted numbers directly into
  `financial_impact_minor` without the formula-based calculation (see
  [ADR-0002](../02-architecture/adr/0002-ai-never-computes-money.md))
- Confidence scoring and human verification gate before a finding is
  "final" (see [Mistake lifecycle](../02-architecture/data-model.md#mistakes))
- Prompt-injection test suite as part of the evaluation framework,
  required before Month 3 exit (see
  [roadmap.md § Month 3](../01-product/roadmap.md#month-3--ai--distributed-systems))

## Testing
Maintain a growing corpus of known injection patterns (adapted from
public research plus any real attempts observed in production) and run
it against every model/prompt version change — this corpus doesn't exist
yet; building it is a Month 3 deliverable.
