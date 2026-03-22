import {
  storyDetailSchema,
  storySchema,
  translationResponseSchema,
} from '@real-spanish-stories/shared'
import z from 'zod'
import type {
  StoryDetail,
  Story,
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

export const getStories = async (): Promise<Story[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}stories`)
  if (!response.ok) {
    throw new Error(`Failed to fetch stories: ${response.statusText}`)
  }
  return z.array(storySchema).parse(await response.json())
}

export const getStoryById = async (id: number): Promise<StoryDetail> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}stories/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch story ${id}: ${response.statusText}`)
  }
  return storyDetailSchema.parse(await response.json())
}
