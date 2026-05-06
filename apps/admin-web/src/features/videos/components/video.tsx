import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Check,
  CheckCircle2,
  FileText,
  Film,
  Layers,
  Pencil,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import type { VideoListItem } from "../types"
import { deleteVideo, generateVideo, updateVideo } from "../api"
import { videoQueryOptions } from "../query-options"
import { PROCESSING_STATUSES, VIDEO_LEVELS, videoKeys } from "../constants"
import {
  createStoryFromVideo,
  getStoryByVideoId,
  updateStory,
} from "@/features/stories/api"
import { storyKeys } from "@/features/stories/constants"
import type { StoryLevel, StoryUpdate } from "@real-spanish-stories/shared"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
} from "@/components/ui/alert-dialog"

interface VideoProps {
  video: VideoListItem
}

export function Video({ video }: VideoProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(video.title)
  const [altTitle, setAltTitle] = useState(video.altTitle)
  const [level, setLevel] = useState(video.level || "")
  const [showStoryDialog, setShowStoryDialog] = useState(false)
  const [createdStoryId, setCreatedStoryId] = useState<number | null>(null)
  const [isExistingStory, setIsExistingStory] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const updateMutation = useMutation({
    mutationFn: (data: { title: string; altTitle: string; level?: string }) =>
      updateVideo(video.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.list() })
      setIsEditing(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteVideo(video.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.list() })
    },
  })

  const generateVideoMutation = useMutation({
    mutationFn: () => generateVideo(video.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.list() })
    },
  })

  const createStoryMutation = useMutation({
    mutationFn: () => createStoryFromVideo(video.id),
    onSuccess: (story) => {
      queryClient.invalidateQueries({ queryKey: storyKeys.list() })
      setCreatedStoryId(story.id)
      setIsExistingStory(false)
      setShowStoryDialog(true)
    },
    onError: async (error: Error) => {
      // Check if this is a 409 conflict error
      const is409 =
        error.message.includes("409") ||
        error.message.includes("HTTP 409") ||
        error.message.toLowerCase().includes("already exists") ||
        error.message.includes("[object Object]")

      if (is409) {
        try {
          // Fetch the existing story to get its ID
          const existingStory = await getStoryByVideoId(video.id)
          setCreatedStoryId(existingStory.id)
          setIsExistingStory(true)
        } catch (e) {
          // Fallback if fetch fails - show dialog without update option
          console.error("Failed to fetch existing story:", e)
        }
        setShowStoryDialog(true)
      } else {
        // Log unexpected errors
        console.error("Story creation error:", error)
      }
    },
  })

  const updateStoryMutation = useMutation({
    mutationFn: ({ storyId, data }: { storyId: number; data: StoryUpdate }) =>
      updateStory(storyId, data),
    onSuccess: (story) => {
      queryClient.invalidateQueries({ queryKey: storyKeys.list() })
      setShowStoryDialog(false)
      navigate({ to: "/stories/$id", params: { id: story.id.toString() } })
    },
  })

  const handleSave = () => {
    if (title.trim() && altTitle.trim() && level) {
      updateMutation.mutate({
        title: title.trim(),
        altTitle: altTitle.trim(),
        level: level,
      })
    }
  }

  const handleCancel = () => {
    setTitle(video.title)
    setAltTitle(video.altTitle)
    setLevel(video.level || "")
    setIsEditing(false)
  }

  const handleUpdateStory = async () => {
    if (!createdStoryId) return

    const fullVideo = await queryClient.fetchQuery(videoQueryOptions(video.id))

    updateStoryMutation.mutate({
      storyId: createdStoryId,
      data: {
        title: fullVideo.title,
        altTitle: fullVideo.altTitle,
        level: (fullVideo.level ?? undefined) as unknown as
          | StoryLevel
          | undefined,
        audioPath: fullVideo.audioPath ?? undefined,
        audioFilename: fullVideo.audioFilename ?? undefined,
        transcription: fullVideo.languageTaggedJson ?? undefined,
      },
    })
  }

  const hasAudio = !!video.audioPath
  const hasTranscription = video.hasTranscriptionJson
  const hasSections = video.hasSectionsJson
  const hasLanguageTags = video.hasLanguageTaggedJson
  const canGenerateVideo =
    hasLanguageTags &&
    ["language_tagged", "completed", "failed"].includes(video.status)

  const isProcessing = PROCESSING_STATUSES.includes(
    video.status as (typeof PROCESSING_STATUSES)[number],
  )

  const getStatusBadge = () => {
    if (video.status === "failed")
      return { label: "Failed", variant: "destructive" as const }
    if (video.status === "generating")
      return { label: "Generating...", variant: "secondary" as const }
    if (video.status === "transcribing")
      return { label: "Transcribing...", variant: "secondary" as const }
    if (video.status === "sectioning")
      return { label: "Sectioning...", variant: "secondary" as const }
    if (video.status === "language_tagging")
      return { label: "Tagging...", variant: "secondary" as const }
    if (hasLanguageTags) return { label: "Ready", variant: "default" as const }
    if (hasSections)
      return { label: "In Progress", variant: "secondary" as const }
    if (hasTranscription)
      return { label: "Transcribed", variant: "secondary" as const }
    if (hasAudio)
      return { label: "Audio Uploaded", variant: "secondary" as const }
    return { label: "Draft", variant: "outline" as const }
  }

  const statusBadge = getStatusBadge()

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50">
      <CardHeader className="pb-3">
        {isEditing ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-medium">
                Title (Spanish)
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="El Gato Pequeño"
                autoFocus
                className="font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alt-title" className="text-xs font-medium">
                Title (English)
              </Label>
              <Input
                id="alt-title"
                value={altTitle}
                onChange={(e) => setAltTitle(e.target.value)}
                placeholder="The Small Cat"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level" className="text-xs font-medium">
                Level
              </Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger id="level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_LEVELS.map((lvl) => (
                    <SelectItem key={lvl.value} value={lvl.value}>
                      {lvl.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={
                  !title.trim() ||
                  !altTitle.trim() ||
                  !level ||
                  updateMutation.isPending
                }
                className="gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-xl">{video.title}</CardTitle>
                  <Badge
                    variant={statusBadge.variant}
                    className={isProcessing ? "animate-pulse" : ""}
                  >
                    {statusBadge.label}
                  </Badge>
                </div>
                <CardDescription className="mt-1.5 text-base">
                  {video.altTitle}
                </CardDescription>
                {video.status === "failed" && video.errorMessage && (
                  <p className="mt-1.5 text-sm text-destructive">
                    {video.errorMessage}
                  </p>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete video</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{video.title}"? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {video.level && (
                <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                  <span className="capitalize font-bold text-sm text-foreground">
                    {video.level}
                  </span>
                </div>
              )}
              {hasAudio && (
                <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2 py-1 rounded-md">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Audio</span>
                </div>
              )}
              {hasTranscription && (
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Transcribed</span>
                </div>
              )}
              {hasSections && (
                <div className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-2 py-1 rounded-md">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Sectioned</span>
                </div>
              )}
              {hasLanguageTags && (
                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2 py-1 rounded-md">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Tagged</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      {!isEditing && (
        <>
          <Separator />
          <CardContent className="pt-4">
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="default" className="gap-1.5" asChild>
                <Link
                  to="/videos/$id/upload"
                  params={{ id: video.id.toString() }}
                >
                  <Upload className="h-3.5 w-3.5" />
                  {hasAudio ? "Re-upload" : "Upload Audio"}
                </Link>
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={!hasTranscription}
                asChild={hasTranscription}
              >
                {hasTranscription ? (
                  <Link
                    to="/videos/$id/transcript"
                    params={{ id: video.id.toString() }}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Transcript
                  </Link>
                ) : (
                  <>
                    <FileText className="h-3.5 w-3.5" />
                    Transcript
                  </>
                )}
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={!hasSections}
                asChild={hasSections}
              >
                {hasSections ? (
                  <Link
                    to="/videos/$id/sections"
                    params={{ id: video.id.toString() }}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    Sections
                  </Link>
                ) : (
                  <>
                    <Layers className="h-3.5 w-3.5" />
                    Sections
                  </>
                )}
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={!hasLanguageTags}
                asChild={hasLanguageTags}
              >
                {hasLanguageTags ? (
                  <Link
                    to="/videos/$id/language-tagged"
                    params={{ id: video.id.toString() }}
                  >
                    <Tag className="h-3.5 w-3.5" />
                    Language Tags
                  </Link>
                ) : (
                  <>
                    <Tag className="h-3.5 w-3.5" />
                    Language Tags
                  </>
                )}
              </Button>

              <Button
                size="sm"
                variant="secondary"
                className="gap-1.5"
                onClick={() => generateVideoMutation.mutate()}
                disabled={
                  !canGenerateVideo ||
                  generateVideoMutation.isPending ||
                  video.status === "generating"
                }
              >
                <Film className="h-3.5 w-3.5" />
                {generateVideoMutation.isPending ||
                video.status === "generating"
                  ? "Generating..."
                  : "Generate Video"}
              </Button>

              <Button
                size="sm"
                variant="secondary"
                className="gap-1.5"
                onClick={() => createStoryMutation.mutate()}
                disabled={!hasLanguageTags || createStoryMutation.isPending}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {createStoryMutation.isPending ? "Creating..." : "Create Story"}
              </Button>
            </div>
          </CardContent>
        </>
      )}

      {/* Story creation success/conflict dialog */}
      <AlertDialog
        open={showStoryDialog}
        onOpenChange={(open) => {
          setShowStoryDialog(open)
          if (!open) {
            setCreatedStoryId(null)
            setIsExistingStory(false)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isExistingStory ? "Story Already Exists" : "Story Created"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isExistingStory
                ? "A story already exists for this video. Do you want to update it with the current video values (title, alt_title, level, audio files, and timestamps)?"
                : "Story has been created successfully from this video."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {isExistingStory ? "Cancel" : "Close"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (isExistingStory) {
                  handleUpdateStory()
                } else if (createdStoryId) {
                  navigate({
                    to: "/stories/$id",
                    params: { id: createdStoryId.toString() },
                  })
                } else {
                  navigate({ to: "/stories" })
                }
              }}
              disabled={updateStoryMutation.isPending}
            >
              {isExistingStory
                ? updateStoryMutation.isPending
                  ? "Updating..."
                  : "Update Story"
                : "View Story"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
