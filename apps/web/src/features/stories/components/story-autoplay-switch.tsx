import { Switch } from '@/components/ui/switch'
import { usePreferencesStore } from '@/stores/preferences'

export function StoryAutoplaySwitch() {
  const levelAutoplay = usePreferencesStore((s) => s.levelAutoplay)
  const setLevelAutoplay = usePreferencesStore((s) => s.setLevelAutoplay)

  return (
    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
      <Switch
        checked={levelAutoplay}
        onCheckedChange={setLevelAutoplay}
        aria-label="Autoplay"
      />
      Auto play
    </label>
  )
}
