import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import type { NewsDetail } from "@real-spanish-stories/shared"
import { updateNews } from "../api"
import { newsKeys } from "../constants"
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
import { RichTextEditor } from "@/components/ui/rich-text-editor"

interface NewsEditFormProps {
  news: NewsDetail
}

const editNewsSchema = z.object({
  date: z.string().min(1, "Date is required"),
  title: z.string().max(200).optional(),
  metaDescription: z.string().max(160).optional(),
  summary: z.string().optional(),
  listSummary: z.string().max(300).optional(),
  videoLink: z.string().url().optional().or(z.literal("")),
  transcript: z.string().optional(),
})

type EditNewsFormValues = z.infer<typeof editNewsSchema>

export function NewsEditForm({ news }: NewsEditFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form = useForm<EditNewsFormValues>({
    resolver: zodResolver(editNewsSchema),
    defaultValues: {
      date: news.date,
      title: news.title ?? "",
      metaDescription: news.metaDescription ?? "",
      summary: news.summary ?? "",
      listSummary: news.listSummary ?? "",
      videoLink: news.videoLink ?? "",
      transcript: news.transcript ?? "",
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: EditNewsFormValues) =>
      updateNews(news.id, {
        date: data.date,
        title: data.title,
        metaDescription: data.metaDescription,
        summary: data.summary,
        listSummary: data.listSummary,
        videoLink: data.videoLink || undefined,
        transcript: data.transcript,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(newsKeys.detail(news.id), updated)
      queryClient.invalidateQueries({ queryKey: newsKeys.list() })
      navigate({ to: "/news" })
    },
  })

  function onSubmit(data: EditNewsFormValues) {
    updateMutation.mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          name="metaDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Short SEO description shown in search results"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary (optional)</FormLabel>
              <FormControl>
                <RichTextEditor value={field.value ?? ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="listSummary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Listing summary (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Short plain-text blurb shown on the news list page. Keep it different from the Summary above."
                  {...field}
                />
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
                <RichTextEditor value={field.value ?? ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {updateMutation.isError && (
          <div className="text-sm text-red-600">
            {updateMutation.error.message}
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/news" })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
