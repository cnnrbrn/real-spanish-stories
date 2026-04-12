import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useRef, useState } from "react"
import { detectSections, downloadTranscriptionSubtitle, updateVideo, uploadTranscriptionSubtitle } from "../api"
import { videoKeys } from "../constants"
import { VideoStatus } from "../types"
import type { Video } from "../types"
import { Button } from "@/components/ui/button"

interface WordData {
  word: string
  start: number
  end: number
}

interface TranscriptEditorProps {
  video: Video
}

export function TranscriptEditor({ video }: TranscriptEditorProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const transcriptionData = JSON.parse(video.transcriptionJson!)
  const [words, setWords] = useState<Array<WordData>>(
    transcriptionData.words || [],
  )
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const saveMutation = useMutation({
    mutationFn: () => {
      const updatedTranscription = {
        ...transcriptionData,
        words,
        text: words.map((w) => w.word).join(" "),
      }
      return updateVideo(video.id, {
        transcriptionJson: JSON.stringify(updatedTranscription),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(video.id) })
    },
  })

  const detectSectionsMutation = useMutation({
    mutationFn: () => detectSections(video.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(video.id) })
      navigate({ to: "/videos/$id/sections", params: { id: video.id.toString() } })
    },
  })

  const uploadSubtitleMutation = useMutation({
    mutationFn: (file: File) => uploadTranscriptionSubtitle(video.id, file),
    onSuccess: (updatedVideo) => {
      const newData = JSON.parse(updatedVideo.transcriptionJson!)
      setWords(newData.words || [])
      queryClient.setQueryData(videoKeys.detail(video.id), updatedVideo)
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(video.id) })
      setUploadMessage({ type: 'success', text: 'ASS file imported successfully' })
    },
    onError: (error: Error) => {
      setUploadMessage({ type: 'error', text: `Import failed: ${error.message}` })
    },
  })

  const handleDownloadASS = async () => {
    try {
      const blob = await downloadTranscriptionSubtitle(video.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const slug = video.title.toLowerCase().replace(/[\W_]+/g, '-').replace(/^-|-$/g, '') || 'transcription'
      a.download = `${slug}-transcription.ass`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      setUploadMessage({ type: 'error', text: `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}` })
    }
  }

  const handleUploadASS = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadMessage(null)
      uploadSubtitleMutation.mutate(file)
    }
    // Reset input so same file can be selected again
    event.target.value = ''
  }

  // Allow re-detecting sections from any status that has transcription
  // (excluding in-progress states)
  const inProgressStatuses = [
    VideoStatus.TRANSCRIBING,
    VideoStatus.SECTIONING,
    VideoStatus.LANGUAGE_TAGGING,
    VideoStatus.GENERATING,
  ]
  const canDetectSections =
    video.transcriptionJson && !inProgressStatuses.includes(video.status)

  const handleWordChange = (index: number, newWord: string) => {
    const updated = [...words]
    updated[index] = { ...updated[index], word: newWord }
    setWords(updated)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Transcript: {video.title}</h1>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/videos/$id/upload", params: { id: video.id.toString() } })}
        >
          ← Back to Upload
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleDownloadASS}
            variant="outline"
          >
            Download ASS
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={uploadSubtitleMutation.isPending}
          >
            {uploadSubtitleMutation.isPending ? "Importing..." : "Upload ASS"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".ass"
            onChange={handleUploadASS}
            className="hidden"
          />
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          {video.sectionsJson && !uploadSubtitleMutation.isPending ? (
            <Button
              variant="secondary"
              onClick={() => navigate({ to: "/videos/$id/sections", params: { id: video.id.toString() } })}
            >
              Go to Sections
            </Button>
          ) : !uploadSubtitleMutation.isPending && (
            <Button
              onClick={() => detectSectionsMutation.mutate()}
              disabled={!canDetectSections || detectSectionsMutation.isPending}
              variant="secondary"
            >
              {detectSectionsMutation.isPending ? "Detecting..." : "Detect Sections"}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          Video ID: {video.id} • Status: {video.status} • Words: {words.length}
        </p>
      </div>

      {saveMutation.isError && (
        <div className="rounded-lg border border-red-600 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">
            Failed to save: {saveMutation.error.message}
          </p>
        </div>
      )}

      {saveMutation.isSuccess && (
        <div className="rounded-lg border border-green-600 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-900">
            Transcript saved successfully
          </p>
        </div>
      )}

      {uploadMessage && (
        <div className={`rounded-lg border p-4 ${uploadMessage.type === 'success' ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'}`}>
          <p className={`text-sm font-medium ${uploadMessage.type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
            {uploadMessage.text}
          </p>
        </div>
      )}

      <div>
        <label className="text-sm font-medium">Editable Transcript</label>
        <p className="mb-2 text-xs text-muted-foreground">
          Click any word to edit.
        </p>
        <div className="mt-2 rounded-md border bg-white p-4 leading-relaxed">
          {words.map((wordData, index) => (
            <span key={index} className="inline-block">
              <input
                type="text"
                value={wordData.word}
                onChange={(e) => handleWordChange(index, e.target.value)}
                className="border-none bg-transparent px-1 py-0 text-sm outline-none focus:bg-blue-50 focus:outline focus:outline-blue-500"
                style={{ width: `${Math.max(wordData.word.length + 2, 3)}ch` }}
              />{" "}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
