import { useRouteContext } from '@tanstack/react-router'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { NewsDetail } from '@real-spanish-stories/shared'
import { authClient } from '@/lib/auth-client'
import { useAuthModals } from '@/stores/auth-modals'

interface NewsDownloadsProps {
  news: NewsDetail
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

export function NewsDownloads({ news }: NewsDownloadsProps) {
  const { session: ctxSession } = useRouteContext({ from: '__root__' })
  const { data: clientSession, isPending } = authClient.useSession()
  const session = isPending ? ctxSession : clientSession
  const openLogin = useAuthModals((s) => s.openLogin)
  const [busy, setBusy] = useState(false)

  if (!news.pdfPath) return null

  async function download() {
    if (!session) {
      openLogin({ headline: "Log in to download. It's free." })
      return
    }
    if (busy) return

    setBusy(true)
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}news/${news.id}/pdf`
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

      const blob = await res.blob()
      const headerName = filenameFromContentDisposition(res.headers.get('Content-Disposition'))
      const filename = headerName ?? `easy-spanish-news-${news.date}.pdf`
      triggerBrowserDownload(blob, filename)
    } catch {
      toast.error('Download failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        {busy ? 'Downloading…' : 'Download PDF'}
      </button>
    </div>
  )
}
