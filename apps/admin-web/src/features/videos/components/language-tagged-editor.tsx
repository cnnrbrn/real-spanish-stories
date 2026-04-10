import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { generateVideo, tagLanguages, updateVideo } from "../api"
import { videoKeys } from "../constants"
import type { Video } from "../types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@radix-ui/react-label"

interface Word {
  word: string
  start: number
  end: number
  lineBreak?: boolean
  language?: "es" | "en"
}

interface Section {
  type: string
  start_time?: number
  end_time?: number
  words?: Array<Word>
  static?: boolean
  text?: string
}

interface LanguageTaggedJson {
  sections: Array<Section>
}

interface LanguageTaggedEditorProps {
  video: Video
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(1)
  return `${mins}:${secs.padStart(4, "0")}`
}

function getSectionLabel(type: string): string {
  const labels: Record<string, string> = {
    title_spanish: "Title (Spanish)",
    title_english: "Title (English)",
    summary: "Summary",
    vocabulary_header: "Vocabulary Header",
    vocabulary: "Vocabulary",
    verbs_header: "Verbs Header",
    verbs: "Verbs",
    subjunctive_verbs_header: "Subjunctive Verbs Header",
    subjunctive_verbs: "Subjunctive Verbs",
    story_header: "Story Header",
    story: "Story",
  }
  return labels[type] || type
}

function getLanguageColor(language?: string): string {
  if (language === "es") {
    return "bg-red-200 hover:bg-red-300"
  }
  if (language === "en") {
    return "bg-blue-200 hover:bg-blue-300"
  }
  return "bg-gray-200 hover:bg-gray-300"
}

export function LanguageTaggedEditor({ video }: LanguageTaggedEditorProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [data, setData] = useState<LanguageTaggedJson>(() =>
    JSON.parse(video.languageTaggedJson!),
  )
  const [hasChanges, setHasChanges] = useState(false)
  const [draftMode, setDraftMode] = useState(true)

  const saveMutation = useMutation({
    mutationFn: () =>
      updateVideo(video.id, { languageTaggedJson: JSON.stringify(data) }),
    onSuccess: () => {
      setHasChanges(false)
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(video.id) })
    },
  })

  const retagMutation = useMutation({
    mutationFn: () => tagLanguages(video.id),
    onSuccess: (updatedVideo) => {
      if (updatedVideo.languageTaggedJson) {
        setData(JSON.parse(updatedVideo.languageTaggedJson))
        setHasChanges(false)
      }
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(video.id) })
    },
  })

  const generateMutation = useMutation({
    mutationFn: () => generateVideo(video.id, draftMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(video.id) })
    },
  })

  const toggleLanguage = (sectionIndex: number, wordIndex: number) => {
    setData((prev) => {
      const newData = { ...prev }
      newData.sections = [...prev.sections]
      const section = { ...newData.sections[sectionIndex] }
      if (section.words) {
        section.words = [...section.words]
        const word = { ...section.words[wordIndex] }
        word.language = word.language === "es" ? "en" : "es"
        section.words[wordIndex] = word
      }
      newData.sections[sectionIndex] = section
      return newData
    })
    setHasChanges(true)
  }

  const spanishCount = data.sections.reduce((acc, section) => {
    return acc + (section.words?.filter((w) => w.language === "es").length || 0)
  }, 0)

  const englishCount = data.sections.reduce((acc, section) => {
    return acc + (section.words?.filter((w) => w.language === "en").length || 0)
  }, 0)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Language Tags: {video.title}</h1>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={() =>
            navigate({
              to: "/videos/$id/sections",
              params: { id: String(video.id) },
            })
          }
        >
          ← Back to Sections
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => retagMutation.mutate()}
            disabled={retagMutation.isPending}
          >
            {retagMutation.isPending ? "Re-tagging..." : "Re-tag Languages"}
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!hasChanges || saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
          <div className="flex items-center space-x-2 mr-2 border rounded-md px-3 py-2 bg-gray-50">
            <Checkbox
              id="draft-mode"
              checked={draftMode}
              onCheckedChange={(checked) => setDraftMode(checked === true)}
              disabled={generateMutation.isPending || hasChanges}
            />
            <Label htmlFor="draft-mode" className="text-sm cursor-pointer">
              Draft Mode (faster generation)
            </Label>
          </div>
          <Button
            variant="secondary"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || hasChanges}
          >
            {generateMutation.isPending ? "Generating..." : "Generate Video"}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-md">
          Video ID: {video.id} • Status: {video.status} •{" "}
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-red-200 rounded"></span>
            Spanish: {spanishCount}
          </span>{" "}
          •{" "}
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-blue-200 rounded"></span>
            English: {englishCount}
          </span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Click a word to toggle between Spanish and English
        </p>
      </div>

      <div className="space-y-2">
        {data.sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className="rounded-lg border p-4 hover:bg-gray-50"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{getSectionLabel(section.type)}</h3>
                {section.static ? (
                  <p className="text-sm text-muted-foreground">
                    Static text: "{section.text}"
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {section.start_time !== undefined &&
                      section.end_time !== undefined && (
                        <>
                          {formatTime(section.start_time)} -{" "}
                          {formatTime(section.end_time)}
                        </>
                      )}
                    {section.words && ` • ${section.words.length} words`}
                  </p>
                )}
              </div>
            </div>
            {section.words && section.words.length > 0 && (
              <div className="mt-2 rounded bg-gray-100 p-2 text-sm flex flex-wrap gap-1">
                {section.words.map((w, wordIndex) => (
                  <span key={wordIndex} className="inline-flex items-center">
                    <button
                      type="button"
                      onClick={() => toggleLanguage(sectionIndex, wordIndex)}
                      className={`px-1.5 py-0.5 rounded ${getLanguageColor(w.language)}`}
                    >
                      {w.word}
                    </button>
                    {w.lineBreak && (
                      <span className="text-yellow-600 font-bold ml-0.5">
                        |
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
