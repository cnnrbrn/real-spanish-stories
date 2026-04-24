import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useEffect } from "react"
import { Bold, Italic, List, ListOrdered } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  className?: string
}

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html === "<p></p>" ? "" : html)
    },
  })

  // Sync external value changes (e.g. from "Generate" button)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    const normalised = current === "<p></p>" ? "" : current
    if (normalised !== value) {
      editor.commands.setContent(value || "")
    }
  }, [value, editor])

  return (
    <div className={cn("rounded-md border border-input bg-background text-sm", className)}>
      <div className="flex gap-1 border-b border-input p-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("h-7 w-7 p-0", editor?.isActive("bold") && "bg-muted")}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("h-7 w-7 p-0", editor?.isActive("italic") && "bg-muted")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("h-7 w-7 p-0", editor?.isActive("bulletList") && "bg-muted")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("h-7 w-7 p-0", editor?.isActive("orderedList") && "bg-muted")}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert max-w-none px-3 py-2 focus-within:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[80px]"
      />
    </div>
  )
}
