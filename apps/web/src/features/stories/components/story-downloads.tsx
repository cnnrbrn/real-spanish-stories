import { useRouteContext } from '@tanstack/react-router'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { StoryDetail } from '@real-spanish-stories/shared'
import { authClient } from '@/lib/auth-client'
import { useAuthModals } from '@/stores/auth-modals'

interface StoryDownloadsProps {
  story: StoryDetail
}

type DownloadKind = 'pdf-light' | 'pdf-dark' | 'audio'

const PATHS: Record<DownloadKind, string> = {
  'pdf-light': 'pdf/light',
  'pdf-dark': 'pdf/dark',
  audio: 'audio',
}

const LABELS: Record<DownloadKind, string> = {
  'pdf-light': 'PDF (Light)',
  'pdf-dark': 'PDF (Dark)',
  audio: 'Audio',
}

function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(header)
  return match ? decodeURIComponent(match[1]) : null
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(objectUrl)
}

export function StoryDownloads({ story }: StoryDownloadsProps) {
  const { session: ctxSession } = useRouteContext({ from: '__root__' })
  const { data: clientSession, isPending } = authClient.useSession()
  const session = isPending ? ctxSession : clientSession
  const openLogin = useAuthModals((s) => s.openLogin)
  const [busy, setBusy] = useState<DownloadKind | null>(null)

  if (!story.pdfLightPath && !story.pdfDarkPath) return null

  async function download(kind: DownloadKind) {
    if (!session) {
      openLogin({ headline: "Log in to download. It's free." })
      return
    }
    if (busy) return

    setBusy(kind)
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}stories/${story.id}/${PATHS[kind]}`
      const res = await fetch(apiUrl, { credentials: 'include' })

      if (res.status === 429) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null
        toast.error(data?.message ?? 'Daily download limit reached. Try again tomorrow.')
        return
      }
      if (!res.ok) {
        toast.error('Download failed. Please try again.')
        return
      }

      let blob: Blob
      let headerName: string | null = null

      if (kind === 'audio') {
        const { url } = (await res.json()) as { url: string }
        const s3Res = await fetch(url, { credentials: 'omit' })
        if (!s3Res.ok) {
          toast.error('Download failed. Please try again.')
          return
        }
        blob = await s3Res.blob()
      } else {
        blob = await res.blob()
        headerName = filenameFromContentDisposition(res.headers.get('Content-Disposition'))
      }

      const fallback = kind === 'audio' ? story.audioFilename : null
      const filename = headerName ?? fallback ?? `${story.slug}-${kind}`
      triggerBrowserDownload(blob, filename)
    } catch {
      toast.error('Download failed. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  const buttonClass =
    'flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground text-base disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <div className="flex items-center">
      {story.pdfLightPath && (
        <button
          type="button"
          onClick={() => download('pdf-light')}
          disabled={busy !== null}
          className={buttonClass}
        >
          <Download className="w-4 h-4" />
          {busy === 'pdf-light' ? 'Downloading…' : LABELS['pdf-light']}
        </button>
      )}
      {story.pdfDarkPath && (
        <button
          type="button"
          onClick={() => download('pdf-dark')}
          disabled={busy !== null}
          className={buttonClass}
        >
          <Download className="w-4 h-4" />
          {busy === 'pdf-dark' ? 'Downloading…' : LABELS['pdf-dark']}
        </button>
      )}
    </div>
  )
}
