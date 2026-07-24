/**
 * Local stand-in for the AI Assist generate/refine calls.
 * No model is wired up yet — swap these for real Edge Function calls
 * (same shape as lib/ai/api.ts) once one is connected.
 */

export const LOADING_VERBS = [
  'Noodling on it…',
  'Baking up something rad…',
  'Cooking up your copy…',
  'Channeling the brand voice…',
  'Sharpening the hook…',
  'Steeping in ideas…',
  'Polishing the punchline…',
  'Assembling word magic…',
]

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function mockGeneratePostCopy(input: {
  prompt: string
  suggestionLabel?: string | null
}): Promise<string> {
  await delay(2600 + Math.random() * 1200)

  const hook = input.suggestionLabel ?? 'Here\'s a first pass'
  const body = input.prompt.trim()

  return [`${hook} 👀`, body, 'Curious what you think — drop a comment below.'].join(
    '\n\n',
  )
}

export async function mockRefinePostCopy(input: {
  currentCopy: string
  feedback: string
}): Promise<string> {
  await delay(2200 + Math.random() * 1000)

  return `${input.currentCopy}\n\n(Updated per your note: "${input.feedback.trim()}")`
}
