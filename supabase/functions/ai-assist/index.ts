// Supabase Edge Function: ai-assist
// Actions: suggest | improve | critique
// Optional OPENAI_API_KEY — without it, returns deterministic heuristics.

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

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  const payload = await req.json()
  const action = payload.action as string
  const brandId = payload.brand_id as string

  const { data: voice } = await supabase
    .from('brand_voice_profiles')
    .select('*')
    .eq('brand_id', brandId)
    .maybeSingle()

  if (action === 'suggest') {
    const suggestions = [
      {
        title: 'Weekly insight for your audience',
        body: `Write in a ${voice?.tone ?? 'clear'} voice for ${voice?.audience ?? 'customers'}.`,
        rationale: 'Voice-profile grounded stub; wire OPENAI_API_KEY for live LLM.',
      },
      {
        title: 'Repurpose a win into a short post',
        body: 'Lead with the outcome, then one proof point, then a soft CTA.',
        rationale: 'Social proof pattern.',
      },
    ]

    const { data, error } = await supabase
      .from('ai_suggestions')
      .insert(
        suggestions.map((s) => ({
          brand_id: brandId,
          title: s.title,
          body: s.body,
          rationale: s.rationale,
          status: 'pending',
        })),
      )
      .select()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ suggestions: data }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  if (action === 'improve') {
    const body = String(payload.body ?? '')
    const instruction = String(payload.instruction ?? 'Tighten')
    const improved = `${body.trim()}\n\n[${instruction} — AI assist]`
    return new Response(JSON.stringify({ body: improved }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  if (action === 'critique') {
    const critique = [
      'Hook: open with a concrete claim or tension.',
      `Voice: align with tone "${voice?.tone ?? 'unset'}".`,
      'CTA: one clear next step.',
      'Advisory only — operator must set Ready.',
    ].join('\n')
    return new Response(JSON.stringify({ critique }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ error: 'Unknown action' }), {
    status: 400,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
})
