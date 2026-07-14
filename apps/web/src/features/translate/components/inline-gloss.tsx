import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

// Vertical space reserved above a glossed word. Applied as padding-top on an
// in-flow wrapper so the line grows and pushes following lines down (rather
// than a floating layer overlapping the line above, Readlang-style).
export const GLOSS_RESERVED_SPACE = '1.65rem'

const WORD_INDEX_ATTR = 'data-word-index'

// The gloss itself: the machine translation in the brand colour, centred over
// the phrase. Absolutely positioned into the space GlossReservation reserves.
function InlineGloss({
  gloss,
  isLoading,
  centerX,
}: {
  gloss: string | null
  isLoading: boolean
  centerX: number
}) {
  return (
    <span
      role="status"
      aria-live="polite"
      style={{ left: centerX, transform: 'translateX(-50%)' }}
      className="pointer-events-none absolute top-0 whitespace-nowrap text-lg font-medium leading-tight text-primary select-none"
    >
      {isLoading ? (
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent align-middle" />
      ) : (
        gloss
      )}
    </span>
  )
}

// Wraps the first word of a glossed phrase so its gloss sits above it. The
// padding-top reserves in-flow vertical space (pushing following lines down);
// the gloss is centred over the whole phrase (first word → hiIndex word),
// measured from the DOM. Keep the selection highlight on `children` (not this
// wrapper) so it doesn't bleed into the reserved gloss area.
export function GlossReservation({
  gloss,
  isLoading,
  hiIndex,
  children,
}: {
  gloss: string | null
  isLoading: boolean
  hiIndex: number
  children: ReactNode
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [centerX, setCenterX] = useState(0)

  useLayoutEffect(() => {
    const wrapper = ref.current
    if (!wrapper) return
    const firstRect = wrapper.getBoundingClientRect()
    const lastEl = document.querySelector<HTMLElement>(
      `[${WORD_INDEX_ATTR}="${hiIndex}"]`,
    )
    const lastRect = lastEl?.getBoundingClientRect() ?? firstRect
    // Centre over the phrase: midpoint of first-word-left..last-word-right,
    // expressed relative to the wrapper's own left edge.
    setCenterX((firstRect.left + lastRect.right) / 2 - firstRect.left)
  }, [hiIndex])

  return (
    <span
      ref={ref}
      style={{
        position: 'relative',
        display: 'inline-block',
        paddingTop: GLOSS_RESERVED_SPACE,
      }}
    >
      <InlineGloss gloss={gloss} isLoading={isLoading} centerX={centerX} />
      {children}
    </span>
  )
}
