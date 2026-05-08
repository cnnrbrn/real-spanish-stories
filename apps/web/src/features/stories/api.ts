import {
  storyDetailSchema,
  storyGroupSchema,
  storySchema,
  translationResponseSchema,
} from '@real-spanish-stories/shared'
import z from 'zod'
import { apiFetch } from '@/lib/api'
import type {
  StoryDetail,
  StoryGroup,
  StoryLevel,
  StoryResponse,
  TranslationResponse,
} from '@real-spanish-stories/shared'

export async function translatePhrase(
  phrase: string,
  storyId: number,
): Promise<TranslationResponse> {
  const response = await apiFetch('translate/word', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phrase, storyId }),
  })
  return translationResponseSchema.parse(await response.json())
}

export const getStories = async (
  levels?: StoryLevel[],
): Promise<StoryResponse[]> => {
  const params = levels?.map((l) => `level=${l}`).join('&')
  const response = await apiFetch(`stories${params ? `?${params}` : ''}`)
  return z.array(storySchema).parse(await response.json())
}

export const getStoriesGrouped = async (): Promise<StoryGroup[]> => {
  const response = await apiFetch('stories/grouped')
  return z.array(storyGroupSchema).parse(await response.json())
}

export const getStoryBySlug = async (slug: string): Promise<StoryDetail> => {
  const response = await apiFetch(`stories/${slug}`)
  return storyDetailSchema.parse(await response.json())
}
