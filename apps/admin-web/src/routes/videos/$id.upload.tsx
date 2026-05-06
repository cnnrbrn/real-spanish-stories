import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect, useState } from "react"
import { uploadAudio } from "@/features/videos/api"
import { videoQueryOptions } from "@/features/videos/query-options"
import {
  TRANSCRIPTION_SERVICES,
  TRANSCRIPTION_SERVICE_OPTIONS,
  VIDEO_LEVELS,
  videoKeys,
} from "@/features/videos/constants"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const Route = createFileRoute("/videos/$id/upload")({
  loader: async ({ context, params }) => {
    const videoId = parseInt(params.id)
    return context.queryClient.ensureQueryData(videoQueryOptions(videoId))
  },
  component: UploadAudioPage,
})

const audioUploadSchema = z.object({
  audioFile: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "Audio file is required")
    .refine((files) => {
      const file = files[0]
      return ["audio/mpeg", "audio/wav", "audio/mp3"].includes(file.type)
    }, "Only WAV and MP3 files are supported")
    .refine((files) => {
      const file = files[0]
      return file.size <= 50 * 1024 * 1024 // 50MB
    }, "File size must be less than 50MB"),
  transcriptionOption: z.enum(TRANSCRIPTION_SERVICE_OPTIONS),
  fixTimestamps: z.boolean(),
})

type AudioUploadFormValues = z.infer<typeof audioUploadSchema>

function UploadAudioPage() {
  const { id } = Route.useParams()
  const videoId = parseInt(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: video } = useSuspenseQuery(videoQueryOptions(videoId))

  const form = useForm<AudioUploadFormValues>({
    resolver: zodResolver(audioUploadSchema),
    defaultValues: {
      fixTimestamps: false,
    },
  })

  const [isPolling, setIsPolling] = useState(false)

  const uploadMutation = useMutation({
    mutationFn: ({
      file,
      transcriptionOption,
      fixTimestamps,
    }: {
      file: File
      transcriptionOption: string
      fixTimestamps: boolean
    }) => uploadAudio(videoId, file, transcriptionOption, fixTimestamps),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(videoId) })
      setIsPolling(true)
    },
    onError: () => {
      setIsPolling(false)
    },
  })

  useEffect(() => {
    if (!isPolling) return

    const interval = setInterval(async () => {
      const updatedVideo = await queryClient.fetchQuery(
        videoQueryOptions(videoId),
      )

      if (updatedVideo.status === "transcribed") {
        setIsPolling(false)
        queryClient.invalidateQueries({ queryKey: videoKeys.list() })
        navigate({ to: `/videos/${videoId}/transcript` })
      } else if (updatedVideo.status === "failed") {
        setIsPolling(false)
        queryClient.invalidateQueries({ queryKey: videoKeys.detail(videoId) })
      }
    }, 2500)

    return () => clearInterval(interval)
  }, [isPolling, videoId, queryClient, navigate])

  function onSubmit(data: AudioUploadFormValues) {
    const file = data.audioFile[0]
    uploadMutation.mutate({
      file,
      transcriptionOption: data.transcriptionOption,
      fixTimestamps: data.fixTimestamps,
    })
  }

  const isFormDisabled = uploadMutation.isPending || isPolling

  const getStatusMessage = () => {
    if (uploadMutation.isPending) return "Uploading audio file..."
    if (isPolling && video.status === "transcribing")
      return "Transcribing audio..."
    if (isPolling && video.status === "aligning")
      return "Aligning timestamps..."
    if (video.status === "failed")
      return `Transcription failed: ${video.errorMessage || "Unknown error"}`
    return null
  }

  const statusMessage = getStatusMessage()

  const levelLabel = VIDEO_LEVELS.find((l) => l.value === video.level)?.label

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Upload Audio for: {video.title}
          {levelLabel ? ` (${levelLabel})` : ""}
        </h1>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          Video ID: {video.id} • Status: {video.status}
        </p>
      </div>

      {statusMessage && (
        <div
          className={`rounded-lg border p-4 ${video.status === "failed" ? "border-red-600 bg-red-50" : "border-blue-600 bg-blue-50"}`}
        >
          <p
            className={`text-sm font-medium ${video.status === "failed" ? "text-red-900" : "text-blue-900"}`}
          >
            {statusMessage}
          </p>
        </div>
      )}

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
                    disabled={isFormDisabled}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Upload a WAV or MP3 audio file (max 50MB)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transcriptionOption"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transcription Service</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isFormDisabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transcription service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={TRANSCRIPTION_SERVICES.LOCAL_WHISPERX}>
                      Local WhisperX (best quality, may have timestamp drift on
                      CPU)
                    </SelectItem>
                    <SelectItem value={TRANSCRIPTION_SERVICES.REPLICATE}>
                      Replicate (cloud API, faster, requires API key)
                    </SelectItem>
                    <SelectItem value={TRANSCRIPTION_SERVICES.DEEPGRAM}>
                      Deepgram Nova-3 (cloud API, best for mixed Spanish/English)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose which transcription service to use for this video
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fixTimestamps"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isFormDisabled}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Fix timestamps</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {uploadMutation.isError && (
            <div className="text-sm text-red-600">
              {uploadMutation.error.message}
            </div>
          )}

          <Button type="submit" disabled={isFormDisabled}>
            {uploadMutation.isPending ? "Uploading..." : "Upload Audio"}
          </Button>
        </form>
      </Form>

      {video.status === "transcribed" && (
        <Button asChild>
          <Link to={`/videos/$id/transcript`} params={{ id }}>
            View Transcript
          </Link>
        </Button>
      )}
    </div>
  )
}
