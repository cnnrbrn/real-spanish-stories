import { glossResponseSchema } from '@real-spanish-stories/shared'
import { apiFetch } from '@/lib/api'
import type { GlossResponse } from '@real-spanish-stories/shared'

// Fast, context-free machine-translation gloss for a phrase. Shared by both
// stories and news — the slower LLM explanation stays on translate/word.
export async function translateGloss(phrase: string): Promise<GlossResponse> {
  const response = await apiFetch('translate/gloss', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phrase }),
  })
  return glossResponseSchema.parse(await response.json())
}
