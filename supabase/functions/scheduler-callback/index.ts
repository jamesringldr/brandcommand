// Supabase Edge Function: scheduler-callback
// Called by social-scheduler on publish confirm/fail.
// Verify SCHEDULER_WEBHOOK_SECRET; use service role to set Posted.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-scheduler-secret',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  const secret = Deno.env.get('SCHEDULER_WEBHOOK_SECRET')
  const provided =
    req.headers.get('x-scheduler-secret') ??
    new URL(req.url).searchParams.get('secret')

  if (!secret || provided !== secret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const body = await req.json()
  const { content_item_id, status, error: publishError } = body as {
    content_item_id: string
    status: 'posted' | 'failed'
    error?: string
  }

  if (status === 'failed') {
    const { data, error } = await admin
      .from('content_items')
      .update({
        status: 'Ready',
        schedule_error: publishError ?? 'Publish failed',
        scheduled_at: null,
        external_job_id: null,
      })
      .eq('id', content_item_id)
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ item: data }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  const { data, error } = await admin
    .from('content_items')
    .update({
      status: 'Posted',
      posted_at: new Date().toISOString(),
      schedule_error: null,
    })
    .eq('id', content_item_id)
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ item: data }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
})
