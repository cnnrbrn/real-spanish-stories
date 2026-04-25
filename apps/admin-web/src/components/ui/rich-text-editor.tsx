import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useEffect, useState } from "react"
import { Bold, Italic, List, ListOrdered } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  className?: string
}

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const [showHtml, setShowHtml] = useState(false)
  const [htmlValue, setHtmlValue] = useState(value)

  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const normalised = html === "<p></p>" ? "" : html
      setHtmlValue(normalised)
      onChange(normalised)
    },
  })

  // Sync external value changes (e.g. from "Generate" button)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    const normalised = current === "<p></p>" ? "" : current
    if (normalised !== value) {
      editor.commands.setContent(value || "")
      setHtmlValue(value || "")
    }
  }, [value, editor])

  function handleHtmlApply() {
    editor?.commands.setContent(htmlValue)
  }

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
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("h-7 px-2 font-mono text-xs", showHtml && "bg-muted")}
          onClick={() => setShowHtml((v) => !v)}
        >
          {"</>"}
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="px-3 py-2 focus-within:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-20 [&_.tiptap_p]:my-1 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5 [&_.tiptap_li]:my-0.5 [&_.tiptap_strong]:font-bold [&_.tiptap_em]:italic"
      />
      {showHtml && (
        <div className="border-t border-input">
          <textarea
            value={htmlValue}
            onChange={(e) => setHtmlValue(e.target.value)}
            className="w-full bg-muted/40 p-2 font-mono text-xs resize-y min-h-20 outline-none"
            spellCheck={false}
          />
          <div className="flex justify-end border-t border-input p-1">
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={handleHtmlApply}>
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
