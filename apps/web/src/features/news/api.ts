import {
  newsDetailSchema,
  newsResponseSchema,
  translationResponseSchema,
} from '@real-spanish-stories/shared'
import z from 'zod'
import { apiFetch } from '@/lib/api'
import type {
  NewsDetail,
  NewsResponse,
  TranslationResponse,
} from '@real-spanish-stories/shared'

export async function translateNewsPhrase(
  phrase: string,
  newsId: number,
): Promise<TranslationResponse> {
  const response = await apiFetch('translate/word', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phrase, newsId }),
  })
  return translationResponseSchema.parse(await response.json())
}

export const getNews = async (): Promise<NewsResponse[]> => {
  const response = await apiFetch('news')
  return z.array(newsResponseSchema).parse(await response.json())
}

export const getNewsByDate = async (date: string): Promise<NewsDetail> => {
  const response = await apiFetch(`news/${date}`)
  return newsDetailSchema.parse(await response.json())
}
