import { newsDetailSchema, newsResponseSchema } from '@real-spanish-stories/shared'
import z from 'zod'
import { apiFetch } from '@/lib/api'
import type { NewsDetail, NewsResponse } from '@real-spanish-stories/shared'

export const getNews = async (): Promise<NewsResponse[]> => {
  const response = await apiFetch('news')
  return z.array(newsResponseSchema).parse(await response.json())
}

export const getNewsByDate = async (date: string): Promise<NewsDetail> => {
  const response = await apiFetch(`news/${date}`)
  return newsDetailSchema.parse(await response.json())
}
