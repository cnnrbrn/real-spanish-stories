import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createNews } from '../api'
import { newsKeys } from '../constants'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

const newsFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  title: z.string().max(200).optional(),
  metaDescription: z.string().max(160).optional(),
  videoLink: z.string().url().optional().or(z.literal('')),
  transcript: z.string().optional(),
})

type NewsFormValues = z.infer<typeof newsFormSchema>

export function NewsForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      date: '',
      title: '',
      metaDescription: '',
      videoLink: '',
      transcript: '',
    },
  })

  const createMutation = useMutation({
    mutationFn: createNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.list() })
      navigate({ to: '/news' })
    },
  })

  function onSubmit(data: NewsFormValues) {
    createMutation.mutate({
      date: data.date,
      title: data.title || undefined,
      metaDescription: data.metaDescription || undefined,
      videoLink: data.videoLink || undefined,
      transcript: data.transcript || undefined,
    })
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
                <Input placeholder="Enter a title" {...field} />
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
          name="videoLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>YouTube URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." type="url" {...field} />
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
                <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {createMutation.isError && (
          <div className="text-sm text-red-600">
            {createMutation.error.message}
          </div>
        )}

        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Creating...' : 'Create News Item'}
        </Button>
      </form>
    </Form>
  )
}
