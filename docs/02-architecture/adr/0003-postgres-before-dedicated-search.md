# ADR-0003: PostgreSQL + pgvector before a dedicated search/vector system

**Status:** Accepted

## Context
Search and semantic-similarity needs (entity resolution, evidence
retrieval for RAG) are real but low-volume at pilot scale. Standing up
Elasticsearch or a dedicated vector database adds an operational surface
before there's evidence the built-in options can't keep up.

## Decision
Use PostgreSQL full-text search plus the pgvector extension for both
structured search and embedding similarity through MVP and initial
pilots. Revisit only when query latency or relevance is measured to be
a problem PostgreSQL can't solve with better indexing.

## Consequences
- One fewer system to operate, secure, and back up during the highest-
  risk build phase.
- Revisit trigger should be a specific measured threshold (e.g. p95
  search latency, index size) defined once real usage data exists —
  not defined yet, add during Month 2–3.
