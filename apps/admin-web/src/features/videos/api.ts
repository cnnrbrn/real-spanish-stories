import type { Video, VideoCreate, VideoUpdate } from "./types"
import { API_URL } from "@/config"

export async function listVideos(): Promise<Array<Video>> {
  const res = await fetch(`${API_URL}/videos`)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function getVideo(id: number): Promise<Video> {
  const res = await fetch(`${API_URL}/videos/${id}`)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function createVideo(data: VideoCreate): Promise<Video> {
  const res = await fetch(`${API_URL}/videos`, {
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

export async function updateVideo(
  id: number,
  data: VideoUpdate,
): Promise<Video> {
  const res = await fetch(`${API_URL}/videos/${id}`, {
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

export async function uploadAudio(
  id: number,
  audioFile: File,
  transcriptionOption: string,
  useSpanishHeadings: boolean = false,
  fixTimestamps: boolean = false,
): Promise<Video> {
  const formData = new FormData()
  formData.append("audioFile", audioFile)

  const url = new URL(`${API_URL}/videos/${id}/upload-audio`)
  url.searchParams.set("transcriptionOption", transcriptionOption)
  url.searchParams.set("useSpanishHeadings", String(useSpanishHeadings))
  url.searchParams.set("fixTimestamps", String(fixTimestamps))

  const res = await fetch(url.toString(), {
    method: "POST",
    body: formData,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function deleteVideo(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/videos/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
}

export async function detectSections(id: number): Promise<Video> {
  const res = await fetch(`${API_URL}/videos/${id}/detect-sections`, {
    method: "POST",
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function tagLanguages(id: number): Promise<Video> {
  const res = await fetch(`${API_URL}/videos/${id}/tag-languages`, {
    method: "POST",
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function generateVideo(
  id: number,
  draftMode: boolean = true,
): Promise<Video> {
  const url = new URL(`${API_URL}/videos/${id}/generate-video`)
  url.searchParams.set("draftMode", String(draftMode))

  const res = await fetch(url.toString(), {
    method: "POST",
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function downloadTranscriptionSubtitle(id: number): Promise<Blob> {
  const res = await fetch(`${API_URL}/videos/${id}/transcription-subtitle`)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.blob()
}

export async function uploadTranscriptionSubtitle(
  id: number,
  file: File,
): Promise<Video> {
  const formData = new FormData()
  formData.append("subtitleFile", file)

  const res = await fetch(`${API_URL}/videos/${id}/transcription-subtitle`, {
    method: "POST",
    body: formData,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}
