import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { StoryDetail as Story } from "@real-spanish-stories/shared"
import { STORY_LEVEL_VALUES } from "@real-spanish-stories/shared"
import {
  updateStory,
  generateStoryDescription,
  generateStorySummary,
} from "../api"
import { storyKeys } from "../constants"
import { VIDEO_LEVELS } from "@/features/videos/constants"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface StoryEditModalProps {
  story: Story
  trigger: React.ReactNode
}

const editStorySchema = z.object({
  title: z.string().min(1).max(200),
  altTitle: z.string().min(1).max(200),
  description: z.string().max(160).nullable().optional(),
  summary: z.string().nullable().optional(),
  level: z.enum(STORY_LEVEL_VALUES).optional(),
  videoLink: z.string().url().optional(),
  isPremium: z.boolean(),
})

type EditStoryFormValues = z.infer<typeof editStorySchema>

export function StoryEditModal({ story, trigger }: StoryEditModalProps) {
  const [open, setOpen] = useState(false)
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<EditStoryFormValues>({
    resolver: zodResolver(editStorySchema),
    defaultValues: {
      title: story.title,
      altTitle: story.altTitle,
      description: story.description ?? "",
      summary: story.summary ?? "",
      level: story.level,
      videoLink: story.videoLink || undefined,
      isPremium: story.isPremium,
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: EditStoryFormValues) => updateStory(story.id, data),
    onSuccess: (updatedStory) => {
      queryClient.setQueryData(["stories", story.id], updatedStory)
      queryClient.invalidateQueries({ queryKey: storyKeys.list() })
      setOpen(false)
    },
  })

  async function handleGenerateSummary() {
    setIsGeneratingSummary(true)
    try {
      const { summary } = await generateStorySummary(story.id)
      form.setValue("summary", summary, { shouldValidate: true })
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  async function handleGenerate() {
    setIsGeneratingDescription(true)
    try {
      const { description } = await generateStoryDescription(story.id)
      form.setValue("description", description, { shouldValidate: true })
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  function onSubmit(data: EditStoryFormValues) {
    updateMutation.mutate(data)
  }

  const descriptionValue = form.watch("description") ?? ""
  const charCount =
    typeof descriptionValue === "string" ? descriptionValue.length : 0

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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Description</FormLabel>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs ${charCount > 160 ? "text-destructive" : "text-muted-foreground"}`}
                      >
                        {charCount}/160
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerate}
                        disabled={isGeneratingDescription}
                      >
                        {isGeneratingDescription ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Generating...
                          </>
                        ) : (
                          "Generate"
                        )}
                      </Button>
                    </div>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder="A beginner-level Spanish story about..."
                      className="resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Summary</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateSummary}
                      disabled={isGeneratingSummary}
                    >
                      {isGeneratingSummary ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Generating...
                        </>
                      ) : (
                        "Generate"
                      )}
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder="A beginner-level story about..."
                      className="resize-none"
                      rows={4}
                    />
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
