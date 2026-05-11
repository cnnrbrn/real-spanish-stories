import { Switch } from '@/components/ui/switch'
import { usePreferencesStore } from '@/stores/preferences'

export function SkipToStorySwitch() {
  const skipToStory = usePreferencesStore((s) => s.skipToStory)
  const setSkipToStory = usePreferencesStore((s) => s.setSkipToStory)

  return (
    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
      <Switch
        checked={skipToStory}
        onCheckedChange={setSkipToStory}
        aria-label="Skip to story"
      />
      Skip to story
    </label>
  )
}
