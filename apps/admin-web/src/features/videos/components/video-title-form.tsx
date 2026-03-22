import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createVideo } from '../api'
import { videoKeys, VIDEO_LEVELS } from '../constants'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const videoTitleSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  altTitle: z
    .string()
    .min(1, 'Alt title is required')
    .max(200, 'Alt title must be less than 200 characters'),
  level: z.string().min(1, 'Level is required'),
})

type VideoTitleFormValues = z.infer<typeof videoTitleSchema>

export function VideoTitleForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form = useForm<VideoTitleFormValues>({
    resolver: zodResolver(videoTitleSchema),
    defaultValues: {
      title: '',
      altTitle: '',
      level: '',
    },
  })

  const createMutation = useMutation({
    mutationFn: createVideo,
    onSuccess: (video) => {
      queryClient.invalidateQueries({ queryKey: videoKeys.list() })
      navigate({
        to: `/videos/$id/upload`,
        params: { id: video.id.toString() },
      })
    },
  })

  function onSubmit(data: VideoTitleFormValues) {
    createMutation.mutate({
      title: data.title,
      altTitle: data.altTitle,
      level: data.level,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Title (Spanish)</FormLabel>
              <FormControl>
                <Input placeholder="Enter video title in Spanish" {...field} />
              </FormControl>
              <FormDescription>
                The Spanish title for the video
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="altTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alt Title (English)</FormLabel>
              <FormControl>
                <Input placeholder="Enter video title in English" {...field} />
              </FormControl>
              <FormDescription>
                The English title for the video
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {VIDEO_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The difficulty level of the video
              </FormDescription>
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
          {createMutation.isPending ? 'Creating...' : 'Create Video'}
        </Button>
      </form>
    </Form>
  )
}
