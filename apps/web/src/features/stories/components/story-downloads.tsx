import { useRouteContext } from '@tanstack/react-router'
import { Download } from 'lucide-react'
import type { StoryDetail } from '@real-spanish-stories/shared'
import { authClient } from '@/lib/auth-client'
import { useAuthModals } from '@/stores/auth-modals'

interface StoryDownloadsProps {
  story: StoryDetail
}

export function StoryDownloads({ story }: StoryDownloadsProps) {
  const { session: ctxSession } = useRouteContext({ from: '__root__' })
  const { data: clientSession, isPending } = authClient.useSession()
  const session = isPending ? ctxSession : clientSession
  const openLogin = useAuthModals((s) => s.openLogin)

  if (!story.pdfLightPath && !story.pdfDarkPath) return null

  function gatedClick(e: React.MouseEvent) {
    if (session) return
    e.preventDefault()
    openLogin({ headline: "Log in to download. It's free." })
  }

  const buttonClass =
    'flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground text-base'

  return (
    <div className="flex items-center">
      {story.pdfLightPath && (
        <a
          href={`${import.meta.env.VITE_API_URL}stories/${story.id}/pdf/light`}
          download
          onClick={gatedClick}
          className={buttonClass}
        >
          <Download className="w-4 h-4" />
          PDF (Light)
        </a>
      )}
      {story.pdfDarkPath && (
        <a
          href={`${import.meta.env.VITE_API_URL}stories/${story.id}/pdf/dark`}
          download
          onClick={gatedClick}
          className={buttonClass}
        >
          <Download className="w-4 h-4" />
          PDF (Dark)
        </a>
      )}
    </div>
  )
}
