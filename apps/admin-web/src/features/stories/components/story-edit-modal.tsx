import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Story } from '../types'
import { updateStory } from '../api'
import { storyKeys } from '../constants'
import { VIDEO_LEVELS } from '@/features/videos/constants'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface StoryEditModalProps {
  story: Story
  trigger: React.ReactNode
}

const editStorySchema = z.object({
  title: z.string().min(1).max(200),
  altTitle: z.string().min(1).max(200),
  level: z.string().optional(),
  videoLink: z.string().url().optional(),
  isPremium: z.boolean(),
})

type EditStoryFormValues = z.infer<typeof editStorySchema>

export function StoryEditModal({ story, trigger }: StoryEditModalProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<EditStoryFormValues>({
    resolver: zodResolver(editStorySchema),
    defaultValues: {
      title: story.title,
      altTitle: story.altTitle,
      level: story.level || undefined,
      videoLink: story.videoLink || undefined,
      isPremium: story.isPremium,
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: EditStoryFormValues) =>
      updateStory(story.id, data),
    onSuccess: (updatedStory) => {
      queryClient.setQueryData(['stories', story.id], updatedStory)
      queryClient.invalidateQueries({ queryKey: storyKeys.list() })
      setOpen(false)
    },
  })

  function onSubmit(data: EditStoryFormValues) {
    updateMutation.mutate(data)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Story</AlertDialogTitle>
          <AlertDialogDescription>
            Make changes to "{story.title}"
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (Spanish)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="El Gato Pequeño" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="altTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (English)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="The Small Cat" />
                  </FormControl>
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
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VIDEO_LEVELS.map((lvl) => (
                        <SelectItem key={lvl.value} value={lvl.value}>
                          {lvl.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="videoLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Link</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://..." type="url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPremium"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Premium</FormLabel>
                  </div>
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
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
