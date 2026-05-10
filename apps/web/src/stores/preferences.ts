import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LevelViewMode = 'row' | 'grid'
export type Theme = 'light' | 'dark' | 'system'

interface PreferencesState {
  hintDismissed: boolean
  dismissHint: () => void
  levelViewMode: LevelViewMode
  setLevelViewMode: (mode: LevelViewMode) => void
  audioVolume: number
  setAudioVolume: (volume: number) => void
  audioMuted: boolean
  setAudioMuted: (muted: boolean) => void
  levelAutoplay: boolean
  setLevelAutoplay: (autoplay: boolean) => void
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      hintDismissed: false,
      dismissHint: () => set({ hintDismissed: true }),
      levelViewMode: 'row',
      setLevelViewMode: (mode) => set({ levelViewMode: mode }),
      audioVolume: 1,
      setAudioVolume: (volume) => set({ audioVolume: volume }),
      audioMuted: false,
      setAudioMuted: (muted) => set({ audioMuted: muted }),
      levelAutoplay: false,
      setLevelAutoplay: (autoplay) => set({ levelAutoplay: autoplay }),
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        const current = get().theme
        const resolved =
          current === 'system'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light'
            : current
        set({ theme: resolved === 'dark' ? 'light' : 'dark' })
      },
    }),
    {
      name: 'preferences',
    },
  ),
)

// Inline script in __root.tsx <head> handles first-paint; this subscriber
// handles changes after hydration. The persist key 'preferences' and the
// JSON shape ({state: {theme}}) are duplicated in that script — keep both
// in sync if either changes.
let mediaQuery: MediaQueryList | null = null
let mediaQueryHandler: (() => void) | null = null

function applyTheme(theme: Theme) {
  const resolved =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme
  document.documentElement.classList.toggle('dark', resolved === 'dark')

  if (theme === 'system' && !mediaQuery) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQueryHandler = () => applyTheme('system')
    mediaQuery.addEventListener('change', mediaQueryHandler)
  } else if (theme !== 'system' && mediaQuery && mediaQueryHandler) {
    mediaQuery.removeEventListener('change', mediaQueryHandler)
    mediaQuery = null
    mediaQueryHandler = null
  }
}

if (typeof window !== 'undefined') {
  applyTheme(usePreferencesStore.getState().theme)
  usePreferencesStore.subscribe((state, prev) => {
    if (state.theme !== prev.theme) applyTheme(state.theme)
  })
}
