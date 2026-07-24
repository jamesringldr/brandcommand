# Pending schema — Create Post modal

Fields the Create Post modal (`src/components/composer/`) needs that don't
exist on `content_items` yet. The modal keeps these as local component state
only — nothing below is persisted today. Incorporate when the real DB schema
for this flow gets built.

`platforms` already exists on `content_items` and **is** persisted for real
by the modal — not listed here.

| Field | Type | Notes |
|---|---|---|
| `media_type` | enum | Photo, Carousel, Video, Story, Reel, Text. One per post. |
| `first_comment` | text | Optional first-comment body, posted alongside the main copy. Likely wants to be per-platform eventually (first comment reads differently on IG vs LinkedIn), not a single shared field. |
| `schedule_option` | enum | `now` \| `optimal_time` \| `set_date_time`. Distinct from `scheduled_at` (the resolved timestamp) — this is *how* the user chose the time, which nothing currently records. |

## Optimal Time

"Optimal Time" has no backing algorithm yet. The modal currently mocks it
(picks a near-future slot client-side). Real implementation needs per-channel
highest-traffic-window data — likely sourced from `metric_snapshots` — before
this can compute anything real.
