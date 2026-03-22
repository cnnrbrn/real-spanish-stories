import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PreferencesState {
  hintDismissed: boolean
  dismissHint: () => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      hintDismissed: false,
      dismissHint: () => set({ hintDismissed: true }),
    }),
    {
      name: 'preferences',
    },
  ),
)
