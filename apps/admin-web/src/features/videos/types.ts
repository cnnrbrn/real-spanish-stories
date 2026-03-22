export enum VideoStatus {
  DRAFT = 'draft',
  TRANSCRIBING = 'transcribing',
  TRANSCRIBED = 'transcribed',
  SECTIONING = 'sectioning',
  SECTIONED = 'sectioned',
  LANGUAGE_TAGGING = 'language_tagging',
  LANGUAGE_TAGGED = 'language_tagged',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Video {
  id: number
  title: string
  altTitle: string
  level: string | null
  status: VideoStatus
  useSpanishHeadings: boolean
  audioPath: string | null
  audioFilename: string | null
  transcriptionJson: string | null
  sectionsJson: string | null
  languageTaggedJson: string | null
  transcriptionMarkdown: string | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

export interface VideoCreate {
  title: string
  altTitle: string
  level: string
}

export interface VideoUpdate {
  title?: string
  altTitle?: string
  level?: string
  status?: VideoStatus
  useSpanishHeadings?: boolean
  transcriptionJson?: string
  sectionsJson?: string
  languageTaggedJson?: string
  transcriptionMarkdown?: string
  errorMessage?: string
}
