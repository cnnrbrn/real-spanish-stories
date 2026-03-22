import type { Story, StoryUpdate, StoryStatusUpdate } from "./types"
import { API_URL } from "@/config"

export async function listStories(): Promise<Array<Story>> {
  const res = await fetch(`${API_URL}/stories`)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function getStoryByVideoId(videoId: number): Promise<Story> {
  const res = await fetch(`${API_URL}/stories/by-video/${videoId}`)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function createStoryFromVideo(videoId: number): Promise<Story> {
  const res = await fetch(`${API_URL}/stories/from-video/${videoId}`, {
    method: "POST",
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function updateStory(
  id: number,
  data: StoryUpdate,
): Promise<Story> {
  const res = await fetch(`${API_URL}/stories/${id}`, {
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

export async function updateStoryStatus(
  id: number,
  data: StoryStatusUpdate,
): Promise<Story> {
  const res = await fetch(`${API_URL}/stories/${id}/status`, {
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

export async function deleteStory(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/stories/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
}

export async function createStoryPdfs(
  storyId: number,
): Promise<{ pdfLightPath: string; pdfDarkPath: string }> {
  const res = await fetch(`${API_URL}/stories/${storyId}/create-pdfs`, {
    method: "POST",
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function deleteStoryPdfs(storyId: number): Promise<void> {
  const res = await fetch(`${API_URL}/stories/${storyId}/pdfs`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
}

export async function uploadStoryAudio(storyId: number, file: File, name: string): Promise<Story> {
  const formData = new FormData()
  formData.append("audioFile", file)
  formData.append("name", name)

  const res = await fetch(`${API_URL}/stories/${storyId}/upload-audio`, {
    method: "POST",
    body: formData,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}
