import type {
  NewsCreate,
  NewsDetail,
  NewsStatusUpdate,
  NewsUpdate,
} from "@real-spanish-stories/shared"
import { API_URL } from "@/config"

export async function listNews(): Promise<Array<NewsDetail>> {
  const res = await fetch(`${API_URL}/news`)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function getNews(id: number): Promise<NewsDetail> {
  const res = await fetch(`${API_URL}/news/${id}`)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function createNews(data: NewsCreate): Promise<NewsDetail> {
  const res = await fetch(`${API_URL}/news`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function updateNews(
  id: number,
  data: NewsUpdate,
): Promise<NewsDetail> {
  const res = await fetch(`${API_URL}/news/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function updateNewsStatus(
  id: number,
  data: NewsStatusUpdate,
): Promise<NewsDetail> {
  const res = await fetch(`${API_URL}/news/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function deleteNews(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/news/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
}

export async function createNewsPdf(id: number): Promise<{ pdfPath: string }> {
  const res = await fetch(`${API_URL}/news/${id}/create-pdf`, {
    method: "POST",
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function deleteNewsPdf(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/news/${id}/pdf`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
}
