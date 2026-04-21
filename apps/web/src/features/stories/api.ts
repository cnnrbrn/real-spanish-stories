import {
  storyDetailSchema,
  storyGroupSchema,
  storySchema,
  translationResponseSchema,
} from '@real-spanish-stories/shared'
import z from 'zod'
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
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}translate/word`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phrase, storyId }),
    },
  )
  if (!response.ok) {
    throw new Error(`Translation failed: ${response.statusText}`)
  }
  return translationResponseSchema.parse(await response.json())
}

export const getStories = async (levels?: StoryLevel[]): Promise<StoryResponse[]> => {
  const params = levels?.map((l) => `level=${l}`).join('&')
  const url = params
    ? `${import.meta.env.VITE_API_URL}stories?${params}`
    : `${import.meta.env.VITE_API_URL}stories`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch stories: ${response.statusText}`)
  }
  return z.array(storySchema).parse(await response.json())
}

export const getStoriesGrouped = async (): Promise<StoryGroup[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}stories/grouped`)
  if (!response.ok) {
    throw new Error(`Failed to fetch grouped stories: ${response.statusText}`)
  }
  return z.array(storyGroupSchema).parse(await response.json())
}

export const getStoryBySlug = async (slug: string): Promise<StoryDetail> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}stories/${slug}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch story ${slug}: ${response.statusText}`)
  }
  return storyDetailSchema.parse(await response.json())
}
