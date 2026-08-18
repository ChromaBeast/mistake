# Threat Model

Did not exist in v1.0 beyond a mention that a STRIDE analysis should be
maintained. This is a starting pass — revisit per major architecture
change, and before each pilot's security questionnaire (see
[../08-compliance/security-questionnaire.md](../08-compliance/security-questionnaire.md)).

## STRIDE pass — MVP scope

| Category | Example threat | Mitigation |
|---|---|---|
| **S**poofing | Attacker forges a session token or impersonates another tenant's user | Server-side session validation, short-lived tokens, MFA for privileged roles |
| **T**ampering | Uploaded document is crafted to manipulate extraction into false entities/amounts | Deterministic financial engine never trusts raw AI output directly for money (see [ADR-0002](../02-architecture/adr/0002-ai-never-computes-money.md)); extraction confidence scoring; human verification gate |
| **R**epudiation | User denies having dismissed a valid finding | Every state transition recorded with actor, timestamp, reason — [mistake_transitions](../02-architecture/data-model.md#mistakes) |
| **I**nformation disclosure | Cross-tenant data leak via a missing `tenant_id` filter | `tenant_id` derived server-side, never client-supplied; data-access-layer-level enforcement (see [access-control-policy.md](./access-control-policy.md)) |
| **D**enial of service | Large/malicious file upload floods processing workers | File size limits, async processing queue with backpressure, per-tenant rate limits on uploads |
| **E**levation of privilege | Analyst-role user calls an Admin-only endpoint directly | Server-side RBAC check on every endpoint, not just UI-level hiding |

## AI-specific threats (see [prompt-security.md](../06-ai/prompt-security.md) for full detail)

- **Prompt injection via uploaded documents.** Uploaded content is
  untrusted. Pipeline: `Untrusted data → Parser → Sanitizer → Content
  classification → LLM`. The LLM never has direct database, filesystem,
  email, payment, or ERP access except through explicit, scoped tools.
- **Data exfiltration via AI-generated recommendations.** Recommendation
  text is never auto-sent externally — a human approves before anything
  leaves the system (see [ai-safety-policy.md](../06-ai/ai-safety-policy.md)).

## Out of scope for MVP threat model
Physical security of customer devices, supply-chain attacks on
third-party npm/Go packages beyond standard dependency scanning (see
[vulnerability-management.md](./vulnerability-management.md)), and
nation-state-level adversaries. Revisit if/when an enterprise customer's
security review requires it.
