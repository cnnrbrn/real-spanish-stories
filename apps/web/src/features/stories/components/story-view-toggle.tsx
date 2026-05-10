import { LayoutGrid, Rows3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePreferencesStore } from '@/stores/preferences'

export function StoryViewToggle() {
  const levelViewMode = usePreferencesStore((s) => s.levelViewMode)
  const setLevelViewMode = usePreferencesStore((s) => s.setLevelViewMode)

  const isRow = levelViewMode === 'row'
  const next = isRow ? 'grid' : 'row'

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={`Switch to ${next} view`}
      onClick={() => setLevelViewMode(next)}
    >
      {isRow ? <LayoutGrid /> : <Rows3 />}
    </Button>
  )
}
