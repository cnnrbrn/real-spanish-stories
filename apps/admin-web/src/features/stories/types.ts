export enum StoryStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export interface Story {
  id: number
  videoId: number | null
  title: string
  altTitle: string
  level: string | null
  status: StoryStatus
  audioPath: string | null
  audioFilename: string | null
  pdfLightPath: string | null
  pdfDarkPath: string | null
  transcription: string | null
  videoLink: string | null
  isPremium: boolean
  createdAt: string
  updatedAt: string
}

export interface StoryUpdate {
  title?: string
  altTitle?: string
  level?: string
  audioPath?: string
  audioFilename?: string
  transcription?: string
  videoLink?: string
  isPremium?: boolean
}

export interface StoryStatusUpdate {
  status: 'draft' | 'published'
}
