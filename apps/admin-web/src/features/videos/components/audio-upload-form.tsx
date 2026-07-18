import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { MAX_AUDIO_UPLOAD_BYTES } from '../constants'

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
      return file.size <= MAX_AUDIO_UPLOAD_BYTES
    }, 'File size must be less than 100MB'),
})

type AudioUploadFormValues = z.infer<typeof audioUploadSchema>

export function AudioUploadForm() {
  const form = useForm<AudioUploadFormValues>({
    resolver: zodResolver(audioUploadSchema),
  })

  function onSubmit(data: AudioUploadFormValues) {
    console.log('Submitting audio file:', data.audioFile[0])
    // TODO: Upload file to API
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  onChange={(e) => onChange(e.target.files)}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Upload a WAV or MP3 audio file (max 100MB)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? 'Uploading...'
            : 'Upload and Generate Video'}
        </Button>
      </form>
    </Form>
  )
}
