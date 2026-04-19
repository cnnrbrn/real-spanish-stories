import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { StoryDetail as Story } from '@real-spanish-stories/shared'
import { uploadStoryAudio } from '../api'
import { storyKeys } from '../constants'
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Upload } from 'lucide-react'

interface StoryAudioUploadModalProps {
  story: Story
  trigger: React.ReactNode
}

const audioUploadSchema = z.object({
  audioFile: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, 'Audio file is required')
    .refine((files) => {
      const file = files[0]
      return ['audio/mpeg', 'audio/wav', 'audio/mp3'].includes(file.type)
    }, 'Only WAV and MP3 files are supported')
    .refine((files) => {
      const file = files[0]
      return file.size <= 30 * 1024 * 1024
    }, 'File size must be less than 30MB'),
  name: z.string().min(1, 'Name is required'),
})

type AudioUploadFormValues = z.infer<typeof audioUploadSchema>

export function StoryAudioUploadModal({ story, trigger }: StoryAudioUploadModalProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<AudioUploadFormValues>({
    resolver: zodResolver(audioUploadSchema),
    defaultValues: { name: '' },
  })

  const uploadMutation = useMutation({
    mutationFn: ({ file, name }: { file: File; name: string }) =>
      uploadStoryAudio(story.id, file, name),
    onSuccess: (updatedStory) => {
      queryClient.setQueryData(['stories', story.id], updatedStory)
      queryClient.invalidateQueries({ queryKey: storyKeys.list() })
      setOpen(false)
      form.reset()
    },
  })

  function onSubmit(data: AudioUploadFormValues) {
    uploadMutation.mutate({ file: data.audioFile[0], name: data.name })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Upload Audio</AlertDialogTitle>
          <AlertDialogDescription>
            {story.audioFilename
              ? `Replace current audio (${story.audioFilename})`
              : 'Add audio file'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="audioFile"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Audio File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="audio/wav,audio/mp3,audio/mpeg"
                      onChange={(e) => {
                        onChange(e.target.files)
                        const file = e.target.files?.[0]
                        if (file) {
                          const nameWithoutExt = file.name.replace(/\.[^.]+$/, '')
                          form.setValue('name', nameWithoutExt, { shouldValidate: true })
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>WAV or MP3 file (max 30MB)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. el-proyecto-cybersyn" {...field} />
                  </FormControl>
                  <FormDescription>Used as the filename in S3</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={uploadMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploadMutation.isPending}
                className="gap-2"
              >
                {uploadMutation.isPending ? (
                  'Uploading...'
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
