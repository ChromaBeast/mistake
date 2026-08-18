# Model Risk Policy

Did not exist explicitly in v1.0. Minimum practice:

- Every model in production (extraction, entity resolution, explanation
  generation) has a tracked version, and every `evidence` /
  `events` row records which model version produced it (see
  [data-model.md](../02-architecture/data-model.md)) — this makes it
  possible to identify and reprocess affected records if a model version
  is later found to have a systematic error.
- Model changes go through the evaluation framework before rollout, not
  after (see [evaluation-framework.md](./evaluation-framework.md)).
- A rollback path exists for any model version — if accuracy regresses
  post-deploy, revert to the last known-good version rather than
  patching forward under pressure.
- Vendor model risk: track each third-party model provider's own
  incident history and terms-of-service changes, since Mistake inherits
  their failure modes (outages, silent behavior changes on model
  updates) — assign explicit ownership for monitoring this, don't leave
  it implicit.
