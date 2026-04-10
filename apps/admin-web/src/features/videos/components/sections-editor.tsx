import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { detectSections, tagLanguages, updateVideo } from "../api"
import { videoKeys } from "../constants"
import type { Video } from "../types"
import { Button } from "@/components/ui/button"

interface Word {
  word: string
  start: number
  end: number
  lineBreak?: boolean
}

interface Section {
  type: string
  start_time?: number
  end_time?: number
  words?: Array<Word>
  static?: boolean
  text?: string
}

interface SectionsJson {
  sections: Array<Section>
}

interface SectionsEditorProps {
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

function extractVerbCount(text: string): number {
  const match = text.match(/incorporar (\d+) verbos/)
  return match ? parseInt(match[1], 10) : 2
}

export function SectionsEditor({ video }: SectionsEditorProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [sectionsData, setSectionsData] = useState<SectionsJson>(() =>
    JSON.parse(video.sectionsJson!)
  )
  const [hasChanges, setHasChanges] = useState(false)

  const redoSectionsMutation = useMutation({
    mutationFn: () => detectSections(video.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(video.id) })
    },
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      updateVideo(video.id, { sectionsJson: JSON.stringify(sectionsData) }),
    onSuccess: () => {
      setHasChanges(false)
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(video.id) })
    },
  })

  const tagLanguagesMutation = useMutation({
    mutationFn: () => tagLanguages(video.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(video.id) })
      navigate({ to: "/videos/$id/language-tagged", params: { id: String(video.id) } })
    },
  })

  const updateVerbCount = (sectionIndex: number, count: number) => {
    setSectionsData((prev) => {
      const newSections = { ...prev, sections: [...prev.sections] }
      const section = { ...newSections.sections[sectionIndex] }
      section.text = `En esta historia vamos a incorporar ${count} verbos en modo subjuntivo.`
      newSections.sections[sectionIndex] = section
      return newSections
    })
    setHasChanges(true)
  }

  const toggleLineBreak = (sectionIndex: number, wordIndex: number) => {
    setSectionsData((prev) => {
      const newSections = { ...prev }
      newSections.sections = [...prev.sections]
      const section = { ...newSections.sections[sectionIndex] }
      if (section.words) {
        section.words = [...section.words]
        const word = { ...section.words[wordIndex] }
        word.lineBreak = !word.lineBreak
        section.words[wordIndex] = word
      }
      newSections.sections[sectionIndex] = section
      return newSections
    })
    setHasChanges(true)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Sections: {video.title}</h1>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/videos/$id/transcript", params: { id: String(video.id) } })}
        >
          ← Back to Transcript
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => redoSectionsMutation.mutate()}
            disabled={redoSectionsMutation.isPending}
          >
            {redoSectionsMutation.isPending ? "Detecting..." : "Redo Sections"}
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!hasChanges || saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
          {video.languageTaggedJson ? (
            <Button
              variant="secondary"
              onClick={() => navigate({ to: "/videos/$id/language-tagged", params: { id: String(video.id) } })}
            >
              Go to Language Tagged
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => tagLanguagesMutation.mutate()}
              disabled={tagLanguagesMutation.isPending}
            >
              {tagLanguagesMutation.isPending ? "Tagging..." : "Tag Languages"}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          Video ID: {video.id} • Status: {video.status} • Sections:{" "}
          {sectionsData.sections.length}
        </p>
      </div>

      <div className="space-y-2">
        {sectionsData.sections.map((section, index) => (
          <div key={index} className="rounded-lg border p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{getSectionLabel(section.type)}</h3>
                {section.type === "subjunctive_verbs_header" ? (
                  <div className="mt-1 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Static text: "{section.text}"
                    </p>
                    {section.start_time !== undefined && section.end_time !== undefined && (
                      <p className="text-sm text-muted-foreground">
                        {formatTime(section.start_time)} – {formatTime(section.end_time)}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Number of verbs:</span>
                      <input
                        type="number"
                        min={1}
                        className="w-20 rounded border px-2 py-1 text-sm"
                        value={extractVerbCount(section.text ?? "")}
                        onChange={(e) => updateVerbCount(index, Number(e.target.value))}
                      />
                    </div>
                  </div>
                ) : section.static ? (
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
                      onClick={() => toggleLineBreak(index, wordIndex)}
                      className={`px-1 rounded hover:bg-gray-200 ${
                        w.lineBreak
                          ? "bg-yellow-100 border border-yellow-400"
                          : ""
                      }`}
                    >
                      {w.word}
                    </button>
                    {w.lineBreak && (
                      <span className="text-yellow-600 font-bold ml-0.5">|</span>
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
