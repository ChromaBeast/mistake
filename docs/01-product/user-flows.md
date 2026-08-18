# User Flows

## Primary flow — first session to first value ("Aha moment")

```
Landing
  ↓
Create Account  ──────────────────────────────┐
  ↓                                            │
Create Business (tenant)                       │  target: < 5 minutes
  ↓                                            │  from landing to first
Upload Records (e.g. one Excel + 3 PDFs)       │  upload
  ↓                                            │
Processing (Queued → Processing →              │
            Extracting → Analyzing)            │
  ↓                                            │
Entity Extraction → Entity Resolution          │
  ↓                                            │
Event Creation                                 │
  ↓                                            │
Mistake Detection → Financial Impact           │
  ↓                                            │
Business Health Dashboard                      │
  "Found 14 mistakes"  ◄────────────────────────┘  target: value visible
  ↓                                                 before any configuration
Open a Mistake
  ↓
Review Evidence
  ↓
Verify / Dismiss
  ↓
Resolve
```

This is the one flow the MVP is built around. Every other flow supports
it. Concretely: **a test user must go from account creation to seeing at
least one real, evidence-backed finding without configuring an
integration, writing a rule, or talking to a salesperson.**

## Supporting flow — ongoing investigation (return usage)

```
Login → Business Health Dashboard
  ↓
Filter by severity / persona view (Financial Issues, Ops Issues, etc.)
  ↓
Open Mistake → Investigation Workspace
  (Summary, Affected Entities, Timeline, Evidence, Explanation, Recommendation)
  ↓
Verify → assign / resolve
   or
Dismiss → record reason
```

## Supporting flow — administration

```
Admin console
  ↓
Users → invite / assign role / revoke session
  ↓
Retention → set policy per data type
  ↓
Audit Log → search by actor / action / date range
```

## Design principle

The dashboard and investigation flows should always answer **"what's
wrong"** before anything else — technical/processing status is secondary
UI, not the headline (see [PRD.md § Business Health Dashboard mockup](./PRD.md)
and [../02-architecture/system-architecture.md](../02-architecture/system-architecture.md)
for how processing status surfaces without competing for attention).
