import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { NewsDetail } from '@real-spanish-stories/shared'
import { updateNewsStatus, deleteNews } from '../api'
import { newsKeys } from '../constants'
import { Trash2, ExternalLink, Edit } from 'lucide-react'
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
import { NewsEditModal } from './news-edit-modal'

interface NewsItemProps {
  news: NewsDetail
}

export function NewsItem({ news }: NewsItemProps) {
  const queryClient = useQueryClient()

  const statusMutation = useMutation({
    mutationFn: (status: 'draft' | 'published') =>
      updateNewsStatus(news.id, { status }),
    onSuccess: (updated) => {
      queryClient.setQueryData(newsKeys.detail(news.id), updated)
      queryClient.invalidateQueries({ queryKey: newsKeys.list() })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteNews(news.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.list() })
    },
  })

  const handleToggleStatus = () => {
    const newStatus = news.status === 'draft' ? 'published' : 'draft'
    statusMutation.mutate(newStatus)
  }

  const isDraft = news.status === 'draft'

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50">
      <CardHeader className="pb-3">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-xl">{news.date}</CardTitle>
                <Badge
                  variant={isDraft ? 'secondary' : 'default'}
                  className="capitalize"
                >
                  {news.status}
                </Badge>
              </div>
              {news.title && (
                <CardDescription className="mt-1.5 text-base">
                  {news.title}
                </CardDescription>
              )}
            </div>
            <div className="flex gap-1">
              <NewsEditModal
                news={news}
                trigger={
                  <Button variant="ghost" size="icon" title="Edit">
                    <Edit className="h-4 w-4" />
                  </Button>
                }
              />
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
                    <AlertDialogTitle>Delete news item</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete the news item for
                      "{news.date}"? This action cannot be undone.
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
            {news.videoLink && (
              <a
                href={news.videoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md hover:bg-muted transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Video Link</span>
              </a>
            )}
            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
              <span>Updated {new Date(news.updatedAt).toLocaleDateString()}</span>
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
      </CardContent>
    </Card>
  )
}
