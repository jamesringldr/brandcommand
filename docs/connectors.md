# Connectors

Credential refs live in `brand_connectors.credentials_ref` and point at **bws**.
Tokens never enter Postgres or this SPA.

## Providers (tier 1)

| Provider | Metrics | Notes |
|---|---|---|
| `ga4` | sessions, users, conversions | GA4 Data API via ingest |
| `gsc` | clicks, impressions, position | Search Console API |
| `meta` | reach / engagement | Facebook Page + Instagram; **Meta app review is the long pole** |
| `calls` | call volume | Later connector |

## Ingest

`brandcommand-ingest/` runs on serv02 (Docker Compose next to the scheduler).
It loads the service-role key + provider secrets from bws at start, pulls daily,
and upserts `metric_snapshots`.

## SPA

Dashboards read `metric_snapshots` through RLS only — no live GA embedding.
