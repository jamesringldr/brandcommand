# ADR amendment — platform selection timing

Resolved during BrandCommand Phase 4 implementation:

**Platforms are selected at schedule time**, not while planning/editing copy.
Stored on `content_items.platforms` when moving Ready → Scheduled.

Rationale: Buffer-style queue; one body can fan out to multiple platforms without
forking content items in v1. Per-platform preview remains Phase 2.
