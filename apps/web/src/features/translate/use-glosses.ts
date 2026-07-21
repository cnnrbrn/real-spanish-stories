import { useCallback, useRef, useState } from 'react'
import { translateGloss } from './api'

// One looked-up phrase and its fast gloss, kept on the page (Readlang-style)
// alongside every other phrase the reader has glossed.
export interface GlossEntry {
  // Unique per word-index range, so results map back to the right entry.
  key: string
  loIndex: number
  hiIndex: number
  gloss: string | null
  isLoading: boolean
}

interface UseGlossesResult {
  glosses: GlossEntry[]
  // Commit a selection. Any existing gloss that overlaps the range is removed;
  // then the new phrase is glossed and fetched — unless the selection just
  // toggles an existing gloss off: either a drag that exactly matches a gloss,
  // or a single-word tap/click landing anywhere inside one. Returns
  // 'added' when a new gloss was created, or 'removed' when the net effect was
  // only removal (so the caller can skip its own follow-up work). Fires the
  // fetch in parallel with the caller's own (slower) LLM call — not awaited.
  // The gloss_cache row is never deleted — removal is purely on-page state.
  select: (loIndex: number, hiIndex: number, phrase: string) => 'added' | 'removed'
  clear: () => void
}

function rangeKey(loIndex: number, hiIndex: number): string {
  return `${loIndex}-${hiIndex}`
}

// Manages the set of glossed phrases shared by the story and news detail pages.
// Multiple glosses coexist; each is rendered in-flow above its own phrase.
// Selections never overlap: a new one removes any it intersects.
export function useGlosses(): UseGlossesResult {
  const [glosses, setGlosses] = useState<GlossEntry[]>([])
  // Mirror of the latest list so `select` can stay identity-stable ([] deps)
  // while still inspecting the current entries without a stale closure.
  const glossesRef = useRef(glosses)
  glossesRef.current = glosses

  const clear = useCallback(() => setGlosses([]), [])

  const select = useCallback(
    (loIndex: number, hiIndex: number, phrase: string): 'added' | 'removed' => {
      const key = rangeKey(loIndex, hiIndex)
      const overlapping = glossesRef.current.filter(
        (g) => g.loIndex <= hiIndex && g.hiIndex >= loIndex,
      )
      // Re-selecting an existing gloss exactly toggles it off.
      const isExactToggle =
        overlapping.length === 1 && overlapping[0].key === key
      // A single-word tap/click that lands anywhere inside an existing gloss
      // clears it, rather than replacing it with a one-word selection — so
      // clicking any part of a phrase selection removes the whole thing. A
      // drag (loIndex !== hiIndex) still replaces the glosses it overlaps.
      const isClickInsideExisting = loIndex === hiIndex && overlapping.length > 0

      if (overlapping.length > 0) {
        const removed = new Set(overlapping.map((g) => g.key))
        setGlosses((prev) => prev.filter((g) => !removed.has(g.key)))
      }
      if (isExactToggle || isClickInsideExisting) return 'removed'

      setGlosses((prev) => [
        ...prev,
        { key, loIndex, hiIndex, gloss: null, isLoading: true },
      ])

      translateGloss(phrase)
        .then((res) => {
          setGlosses((prev) =>
            prev.map((g) =>
              g.key === key ? { ...g, gloss: res.gloss, isLoading: false } : g,
            ),
          )
        })
        .catch(() => {
          // Silent degradation: leave gloss null so nothing renders for this
          // entry. DeepL being down must not disturb the LLM explanation.
          setGlosses((prev) =>
            prev.map((g) =>
              g.key === key ? { ...g, gloss: null, isLoading: false } : g,
            ),
          )
        })

      return 'added'
    },
    [],
  )

  return { glosses, select, clear }
}
