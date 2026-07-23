// Supabase Edge Function: schedule-item
// SPA → this function → social-scheduler on serv02 (browser cannot reach Tailscale).
// Secrets: SCHEDULER_URL, SCHEDULER_TOKEN (from bws / function secrets)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const { content_item_id, brand_id, platforms, scheduled_at } = body

    const { data: access } = await userClient
      .from('user_brands')
      .select('role')
      .eq('brand_id', brand_id)
      .maybeSingle()

    const { data: ownerAny } = await userClient
      .from('user_brands')
      .select('role')
      .eq('role', 'owner')
      .limit(1)

    if (!access && !(ownerAny && ownerAny.length > 0)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const admin = createClient(supabaseUrl, serviceKey)
    const { data: item, error: itemError } = await admin
      .from('content_items')
      .select('*')
      .eq('id', content_item_id)
      .eq('brand_id', brand_id)
      .single()

    if (itemError || !item || item.status !== 'Ready' || item.type !== 'social') {
      return new Response(
        JSON.stringify({ error: 'Item must be Ready social' }),
        {
          status: 400,
          headers: { ...cors, 'Content-Type': 'application/json' },
        },
      )
    }

    const schedulerUrl = Deno.env.get('SCHEDULER_URL')
    const schedulerToken = Deno.env.get('SCHEDULER_TOKEN')
    let externalJobId: string | null = null
    let scheduleError: string | null = null

    if (schedulerUrl && schedulerToken) {
      const res = await fetch(`${schedulerUrl}/api/schedule`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${schedulerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_item_id,
          brand_id,
          platforms,
          scheduled_at,
          title: item.title,
          body: item.body,
        }),
      })
      if (!res.ok) {
        scheduleError = await res.text()
      } else {
        const payload = await res.json()
        externalJobId = payload.job_id ?? payload.id ?? null
      }
    } else {
      scheduleError =
        'SCHEDULER_URL not configured — item marked Scheduled for pipeline testing'
    }

    const { data: updated, error: updateError } = await userClient
      .from('content_items')
      .update({
        status: 'Scheduled',
        scheduled_at,
        platforms,
        external_job_id: externalJobId,
        schedule_error: scheduleError,
      })
      .eq('id', content_item_id)
      .select()
      .single()

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ item: updated }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      },
    )
  }
})
