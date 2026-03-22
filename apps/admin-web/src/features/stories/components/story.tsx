import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Story as StoryType } from '../types'
import { updateStoryStatus, deleteStory, createStoryPdfs, deleteStoryPdfs } from '../api'
import { storyKeys } from '../constants'
import { Trash2, ExternalLink, Music2, Music, Edit, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { API_URL } from '@/config'
import { StoryEditModal } from './story-edit-modal'
import { StoryAudioUploadModal } from './story-audio-upload-modal'

interface StoryProps {
  story: StoryType
}

export function Story({ story }: StoryProps) {
  const queryClient = useQueryClient()

  const statusMutation = useMutation({
    mutationFn: (status: 'draft' | 'published') =>
      updateStoryStatus(story.id, { status }),
    onSuccess: (updatedStory) => {
      queryClient.setQueryData(['stories', story.id], updatedStory)
      queryClient.invalidateQueries({ queryKey: storyKeys.list() })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteStory(story.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storyKeys.list() })
    },
  })

  const createPdfsMutation = useMutation({
    mutationFn: () => createStoryPdfs(story.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storyKeys.list() })
    },
  })

  const deletePdfsMutation = useMutation({
    mutationFn: () => deleteStoryPdfs(story.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storyKeys.list() })
    },
  })

  const handleToggleStatus = () => {
    const newStatus = story.status === 'draft' ? 'published' : 'draft'
    statusMutation.mutate(newStatus)
  }

  const isDraft = story.status === 'draft'
  const hasAudio = !!story.audioFilename
  const hasPdfs = !!story.pdfLightPath || !!story.pdfDarkPath

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50">
      <CardHeader className="pb-3">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-xl">{story.title}</CardTitle>
                <Badge
                  variant={isDraft ? 'secondary' : 'default'}
                  className="capitalize"
                >
                  {story.status}
                </Badge>
                {story.isPremium && (
                  <Badge variant="outline" className="gap-1 bg-amber-50 text-amber-700 border-amber-200">
                    Premium
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-1.5 text-base">
                {story.altTitle}
              </CardDescription>
            </div>
            <div className="flex gap-1">
              <StoryEditModal story={story} trigger={<Button variant="ghost" size="icon" title="Edit"><Edit className="h-4 w-4" /></Button>} />
              <StoryAudioUploadModal
                story={story}
                trigger={
                  <Button variant="ghost" size="icon" title={hasAudio ? 'Replace Audio' : 'Upload Audio'}>
                    {hasAudio ? <Music2 className="h-4 w-4" /> : <Music className="h-4 w-4" />}
                  </Button>
                }
              />
              <Button
                variant="ghost"
                size="icon"
                title={hasPdfs ? 'Recreate PDFs' : 'Create PDFs'}
                onClick={() => createPdfsMutation.mutate()}
                disabled={createPdfsMutation.isPending}
              >
                <FileText className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete story</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{story.title}"? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {story.level && (
              <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                <span className="capitalize font-medium">{story.level}</span>
              </div>
            )}
            {hasAudio && (
              <a
                href={`${API_URL}/stories/${story.id}/audio`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md hover:bg-muted transition-colors"
              >
                <Music2 className="h-3 w-3" />
                <span>{story.audioFilename}</span>
              </a>
            )}
            {story.videoLink && (
              <a
                href={story.videoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md hover:bg-muted transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Video Link</span>
              </a>
            )}
            {story.pdfLightPath && (
              <a
                href={`${API_URL}/stories/${story.id}/pdf-light`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md hover:bg-muted transition-colors"
              >
                <FileText className="h-3 w-3" />
                <span>Light PDF</span>
              </a>
            )}
            {story.pdfDarkPath && (
              <a
                href={`${API_URL}/stories/${story.id}/pdf-dark`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md hover:bg-muted transition-colors"
              >
                <FileText className="h-3 w-3" />
                <span>Dark PDF</span>
              </a>
            )}
            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
              <span>Updated {new Date(story.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <Separator />
      <CardContent className="pt-4 flex gap-2">
        <Button
          size="sm"
          variant={isDraft ? 'default' : 'secondary'}
          onClick={handleToggleStatus}
          disabled={statusMutation.isPending}
        >
          {statusMutation.isPending
            ? 'Updating...'
            : isDraft
            ? 'Publish'
            : 'Unpublish'}
        </Button>
        {hasPdfs && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="hover:text-destructive"
                disabled={deletePdfsMutation.isPending}
              >
                {deletePdfsMutation.isPending ? 'Deleting...' : 'Delete PDFs'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete PDFs</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the PDFs for "{story.title}"? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deletePdfsMutation.mutate()}
                  disabled={deletePdfsMutation.isPending}
                >
                  {deletePdfsMutation.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  )
}
