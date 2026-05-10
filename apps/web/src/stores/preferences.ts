import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LevelViewMode = 'row' | 'grid'

interface PreferencesState {
  hintDismissed: boolean
  dismissHint: () => void
  levelViewMode: LevelViewMode
  setLevelViewMode: (mode: LevelViewMode) => void
  audioVolume: number
  setAudioVolume: (volume: number) => void
  audioMuted: boolean
  setAudioMuted: (muted: boolean) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      hintDismissed: false,
      dismissHint: () => set({ hintDismissed: true }),
      levelViewMode: 'row',
      setLevelViewMode: (mode) => set({ levelViewMode: mode }),
      audioVolume: 1,
      setAudioVolume: (volume) => set({ audioVolume: volume }),
      audioMuted: false,
      setAudioMuted: (muted) => set({ audioMuted: muted }),
    }),
    {
      name: 'preferences',
    },
  ),
)
