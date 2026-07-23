# Scheduling path

The SPA cannot reach serv02 over Tailscale. Scheduling always goes:

```
Browser → Supabase Edge Function `schedule-item`
       → social-scheduler HTTP API on serv02
```

Publish confirmation:

```
social-scheduler → Edge Function `scheduler-callback`
                → service role sets status=Posted (or rolls back to Ready on failure)
```

Secrets (function env / bws): `SCHEDULER_URL`, `SCHEDULER_TOKEN`, `SCHEDULER_WEBHOOK_SECRET`.

Platform targets are chosen **at schedule time** (Buffer-style), stored on
`content_items.platforms`.
