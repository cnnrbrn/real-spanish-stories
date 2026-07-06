import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import type { NewsDetail } from '@real-spanish-stories/shared'
import {
  updateNewsStatus,
  deleteNews,
  createNewsPdf,
  deleteNewsPdf,
} from '../api'
import { newsKeys } from '../constants'
import { Trash2, ExternalLink, Edit, FileText, FileX } from 'lucide-react'
import { API_URL } from '@/config'
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

  const createPdfMutation = useMutation({
    mutationFn: () => createNewsPdf(news.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.list() })
      queryClient.invalidateQueries({ queryKey: newsKeys.detail(news.id) })
    },
  })

  const deletePdfMutation = useMutation({
    mutationFn: () => deleteNewsPdf(news.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.list() })
      queryClient.invalidateQueries({ queryKey: newsKeys.detail(news.id) })
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
              <Button variant="ghost" size="icon" title="Edit" asChild>
                <Link to="/news/$id/edit" params={{ id: String(news.id) }}>
                  <Edit className="h-4 w-4" />
                </Link>
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
      <CardContent className="pt-4 flex flex-wrap gap-2">
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

        <Button
          size="sm"
          variant="outline"
          onClick={() => createPdfMutation.mutate()}
          disabled={createPdfMutation.isPending || !news.transcript}
          title={
            news.transcript
              ? undefined
              : 'Add a transcript before creating a PDF'
          }
        >
          <FileText className="h-4 w-4 mr-1.5" />
          {createPdfMutation.isPending
            ? 'Generating...'
            : news.pdfPath
            ? 'Regenerate PDF'
            : 'Create PDF'}
        </Button>

        {news.pdfPath && (
          <>
            <a
              href={`${API_URL}/news/${news.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 h-8 text-sm font-medium hover:bg-muted transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </a>
            <Button
              size="sm"
              variant="ghost"
              className="hover:text-destructive"
              onClick={() => deletePdfMutation.mutate()}
              disabled={deletePdfMutation.isPending}
              title="Delete PDF"
            >
              <FileX className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardContent>
      {(createPdfMutation.isError || deletePdfMutation.isError) && (
        <CardContent className="pt-0 text-sm text-destructive">
          {(createPdfMutation.error as Error)?.message ??
            (deletePdfMutation.error as Error)?.message}
        </CardContent>
      )}
    </Card>
  )
}
