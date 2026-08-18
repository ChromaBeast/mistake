# Business Continuity Plan

Did not exist in v1.0 beyond being named in the docs structure. Minimum
scope for a small team:

- Key-person risk: document who can operate/redeploy the production
  system if any single engineer is unavailable — for a small team this
  is the single most likely continuity failure, more likely than
  infrastructure failure.
- Dependency risk: what happens if a critical subprocessor (AI model
  provider, cloud host) has an extended outage — see
  [../08-compliance/subprocessors.md](../08-compliance/subprocessors.md)
  for the list this should be checked against.
- Communication plan to customers during an extended outage, separate
  from the security incident notification path in
  [../03-security/incident-response-plan.md](../03-security/incident-response-plan.md)
  (an outage isn't necessarily a security incident).
