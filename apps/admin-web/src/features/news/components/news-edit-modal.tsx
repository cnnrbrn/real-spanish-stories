import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { NewsDetail } from "@real-spanish-stories/shared"
import { updateNews } from "../api"
import { newsKeys } from "../constants"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface NewsEditModalProps {
  news: NewsDetail
  trigger: React.ReactNode
}

const editNewsSchema = z.object({
  date: z.string().min(1, "Date is required"),
  title: z.string().max(200).optional(),
  videoLink: z.string().url().optional().or(z.literal("")),
  transcript: z.string().optional(),
})

type EditNewsFormValues = z.infer<typeof editNewsSchema>

export function NewsEditModal({ news, trigger }: NewsEditModalProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<EditNewsFormValues>({
    resolver: zodResolver(editNewsSchema),
    defaultValues: {
      date: news.date,
      title: news.title ?? "",
      videoLink: news.videoLink ?? "",
      transcript: news.transcript ?? "",
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: EditNewsFormValues) =>
      updateNews(news.id, {
        date: data.date,
        title: data.title || undefined,
        videoLink: data.videoLink || undefined,
        transcript: data.transcript || undefined,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(newsKeys.detail(news.id), updated)
      queryClient.invalidateQueries({ queryKey: newsKeys.list() })
      setOpen(false)
    },
  })

  function onSubmit(data: EditNewsFormValues) {
    updateMutation.mutate(data)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit News Item</AlertDialogTitle>
          <AlertDialogDescription>
            Make changes to the news item for {news.date}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="videoLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://..." type="url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transcript"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transcript</FormLabel>
                  <FormControl>
                    <Textarea rows={10} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
