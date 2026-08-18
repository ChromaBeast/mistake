# AI Evaluation Framework

v1.0 said to track these metrics but gave no target thresholds — a
metric without a target doesn't tell you if Month 3's exit criterion is
met. Targets below are starting proposals; revise once a labeled
evaluation dataset produces real baseline numbers (targets set before
any real data exist are guesses, not commitments — treat them as such
until Month 3).

## Tracked metrics and proposed MVP targets

| Metric | Proposed target | Notes |
|---|---|---|
| Extraction accuracy | ≥ 90% field-level | Against a hand-labeled sample of real uploaded document types |
| Entity-resolution accuracy | ≥ 95% precision on auto-merge | Below-threshold matches route to human review, not blocked |
| Contradiction precision | ≥ 85% | False positives are costlier than false negatives here — see [roadmap.md § Key risks](../01-product/roadmap.md#key-risks) |
| Contradiction recall | ≥ 80% | Tracked separately so precision isn't optimized by suppressing findings |
| Confidence calibration | Predicted confidence within 10pp of observed accuracy per bucket | e.g. findings scored ~90% confidence should be correct ~90% of the time |
| Latency | p95 processing time per document < target TBD by document type | Set after Month 2 build against real documents, not guessed pre-build |
| Token cost / processing cost | Tracked per tenant | Feeds [Unit Economics](../01-product/roadmap.md#metrics-north-star--supporting) |

## Evaluation dataset
A held-out, hand-labeled set of real (or realistic synthetic) documents
covering all five MVP formats and all five detection types, with known
correct extractions and known planted contradictions. Does not exist
yet — building it is itself a Month 2 deliverable, not an afterthought,
since Month 3's exit criterion depends on it.

## Cadence
Run the full evaluation suite on every model or prompt version change,
and on a fixed schedule (weekly, minimum) even without changes, to catch
silent drift from upstream model provider updates.
