import { useCallback, useEffect, useRef, useState } from 'react'

export interface WordSelectionRange {
  loIndex: number
  hiIndex: number
}

export interface WordSelectionHandlers {
  onPointerDown: (event: React.PointerEvent) => void
  onPointerEnter: () => void
  onPointerUp: (event: React.PointerEvent) => void
  onPointerCancel: (event: React.PointerEvent) => void
  onClick: () => void
}

export interface WordSelectionContainerProps {
  onPointerLeave: () => void
  onPointerMove: (event: React.PointerEvent) => void
}

interface UseWordSelectionOptions {
  // Fired with the committed index range (inclusive) on mouse-up, click, or
  // a completed touch tap/long-press-drag.
  onSelect: (range: WordSelectionRange) => void
  // Optional controlled committed selection. When omitted the hook owns it.
  selectedIndices?: Set<number>
}

interface UseWordSelectionResult {
  // Spread the returned handlers onto each selectable word span.
  getWordProps: (globalIndex: number) => WordSelectionHandlers
  // Effective highlight: the live drag range while dragging/selecting, else
  // the committed selection.
  selectedIndices: Set<number>
  // Spread onto the container so a mouse drag that leaves the text is
  // cancelled, and so touch drags can be hit-tested as the finger moves.
  containerProps: WordSelectionContainerProps
  // The word currently showing the "long-press started" pulse, or null.
  pulseIndex: number | null
}

const EMPTY_SELECTION: Set<number> = new Set()

// How long a touch must hold still before it becomes a drag-select gesture
// instead of a scroll.
const LONG_PRESS_MS = 450
// Finger drift before the long-press timer is cancelled and the gesture is
// treated as a scroll instead.
const TOUCH_MOVE_CANCEL_THRESHOLD_PX = 10
// How long the anchor word's "selection started" pulse animation plays.
const PULSE_DURATION_MS = 180
// Duration of the haptic tick fired when a long-press starts a selection.
const HAPTIC_TICK_MS = 15

const WORD_INDEX_ATTR = 'data-word-index'

function rangeToSet(lo: number, hi: number): Set<number> {
  const set = new Set<number>()
  for (let i = lo; i <= hi; i++) set.add(i)
  return set
}

// Finds the word index under a point, or null if the point isn't over a
// word (e.g. inter-word whitespace) — callers should treat null as "keep
// the previous endpoint" rather than losing the selection.
function hitTestWordIndex(clientX: number, clientY: number): number | null {
  const el = document.elementFromPoint(clientX, clientY)
  const wordEl = el?.closest<HTMLElement>(`[${WORD_INDEX_ATTR}]`)
  if (!wordEl) return null
  const raw = wordEl.dataset.wordIndex
  const parsed = raw === undefined ? NaN : Number(raw)
  return Number.isNaN(parsed) ? null : parsed
}

function triggerHaptics() {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  navigator.vibrate(HAPTIC_TICK_MS)
}

// Selection over a flat list of word spans addressed by global index. A
// click/tap always selects just that one word; a phrase requires an
// explicit drag — for either input type, there's no anchor-and-extend
// two-step, since a second unrelated click silently growing into a phrase
// is surprising rather than useful.
//   - Mouse: press and drag across words to select a phrase (live drag state
//     lives in refs — a drag fires pointerenter on every word crossed, so
//     keeping it in state would re-render the whole transcript per tick; a
//     throwaway counter forces the repaint needed for live highlighting). A
//     plain click (press and release with no movement) is left to the
//     browser's own click event, which commits that single word directly.
//   - Touch: a finger drag is normally the scroll gesture, so the container
//     only allows native vertical panning (touch-action: pan-y) and this
//     hook otherwise stays out of the way until it decides a gesture isn't a
//     scroll. Translation on touch always requires a hold: a quick tap does
//     nothing (deliberately — this makes touch fully self-contained in the
//     pointer state machine below, with no dependency on the browser's
//     tap-vs-scroll resolution, which is the exact ambiguity that made a
//     click-driven quick-tap unreliable). Hold still for LONG_PRESS_MS to
//     anchor a word (with a haptic tick + pulse); release immediately to
//     translate just that word, or drag first to extend the live range via
//     hit-testing (not pointerenter, which never re-targets during a touch
//     drag because of implicit pointer capture). Movement past the
//     threshold before the long-press fires cancels the timer and is left
//     alone entirely, so the browser's own compositor handles the scroll
//     natively (smooth, with momentum) instead of us re-implementing it in
//     JS.
export function useWordSelection({
  onSelect,
  selectedIndices,
}: UseWordSelectionOptions): UseWordSelectionResult {
  const startRef = useRef<number | null>(null)
  const endRef = useRef<number | null>(null)
  const isDragging = useRef(false)
  const dragMoved = useRef(false)
  // Set after a mouse drag commits, so the click that follows mouseup
  // doesn't also run handleTap and clobber the drag's range. Reused for
  // touch so a stray compatibility click after a handled tap/drag is inert.
  const suppressNextClick = useRef(false)

  // Touch-only gesture state.
  const touchPointerId = useRef<number | null>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchStartIndex = useRef<number | null>(null)
  const lastHitIndex = useRef<number | null>(null)
  const isTouchSelecting = useRef(false)
  const isScrolling = useRef(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hitTestFrame = useRef<number | null>(null)
  const pendingPoint = useRef<{ x: number; y: number } | null>(null)
  const pulseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [, forceRepaint] = useState(0)
  const [committed, setCommitted] = useState<Set<number>>(EMPTY_SELECTION)
  const [pulseIndex, setPulseIndex] = useState<number | null>(null)

  const repaint = useCallback(() => forceRepaint((n) => n + 1), [])

  const commit = useCallback(
    (loIndex: number, hiIndex: number) => {
      setCommitted(rangeToSet(loIndex, hiIndex))
      onSelect({ loIndex, hiIndex })
    },
    [onSelect],
  )

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current === null) return
    clearTimeout(longPressTimer.current)
    longPressTimer.current = null
  }, [])

  const triggerPulse = useCallback((index: number) => {
    setPulseIndex(index)
    if (pulseTimeout.current !== null) clearTimeout(pulseTimeout.current)
    pulseTimeout.current = setTimeout(() => setPulseIndex(null), PULSE_DURATION_MS)
  }, [])

  const resetTouchGesture = useCallback(() => {
    clearLongPressTimer()
    if (hitTestFrame.current !== null) {
      cancelAnimationFrame(hitTestFrame.current)
      hitTestFrame.current = null
    }
    pendingPoint.current = null
    touchPointerId.current = null
    touchStartIndex.current = null
    lastHitIndex.current = null
    isTouchSelecting.current = false
    isScrolling.current = false
    startRef.current = null
    endRef.current = null
  }, [clearLongPressTimer])

  const scheduleHitTest = useCallback((x: number, y: number) => {
    pendingPoint.current = { x, y }
    if (hitTestFrame.current !== null) return
    hitTestFrame.current = requestAnimationFrame(() => {
      hitTestFrame.current = null
      const point = pendingPoint.current
      if (!point || !isTouchSelecting.current) return
      const hit = hitTestWordIndex(point.x, point.y)
      const nextEnd = hit ?? lastHitIndex.current
      if (hit !== null) lastHitIndex.current = hit
      if (nextEnd !== null && nextEnd !== endRef.current) {
        endRef.current = nextEnd
        repaint()
      }
    })
  }, [repaint])

  const getWordProps = useCallback(
    (globalIndex: number): WordSelectionHandlers => ({
      onPointerDown: (event) => {
        if (event.pointerType === 'touch') {
          if (touchPointerId.current !== null) return
          // No preventDefault here: touch-action:pan-y already governs
          // whether the browser scrolls, and calling it on pointerdown
          // risks suppressing that native scroll before we know this is a
          // long-press rather than a swipe. The -webkit-touch-callout and
          // select-none CSS on the container handles suppressing the native
          // long-press callout instead.
          touchPointerId.current = event.pointerId
          touchStartX.current = event.clientX
          touchStartY.current = event.clientY
          touchStartIndex.current = globalIndex
          lastHitIndex.current = globalIndex
          isTouchSelecting.current = false
          isScrolling.current = false
          clearLongPressTimer()
          longPressTimer.current = setTimeout(() => {
            longPressTimer.current = null
            isTouchSelecting.current = true
            startRef.current = touchStartIndex.current
            endRef.current = touchStartIndex.current
            triggerHaptics()
            if (touchStartIndex.current !== null) triggerPulse(touchStartIndex.current)
            repaint()
          }, LONG_PRESS_MS)
          return
        }
        event.preventDefault()
        // Clear any suppress flag left over from a previous gesture. A drag
        // that ends on a different word than it started fires its trailing
        // synthetic click on the container, not a word span, so no onClick
        // runs to consume the flag — without this reset it would linger and
        // swallow the next genuine click (making a committed phrase take two
        // clicks to dismiss).
        suppressNextClick.current = false
        isDragging.current = true
        dragMoved.current = false
        startRef.current = globalIndex
        endRef.current = globalIndex
        repaint()
      },
      onPointerEnter: () => {
        if (!isDragging.current) return
        endRef.current = globalIndex
        if (globalIndex !== startRef.current) dragMoved.current = true
        repaint()
      },
      onPointerUp: (event) => {
        if (event.pointerType === 'touch') {
          if (touchPointerId.current !== event.pointerId) return
          const wasSelecting = isTouchSelecting.current
          const start = startRef.current
          const end = endRef.current
          resetTouchGesture()
          if (wasSelecting && start !== null && end !== null) {
            commit(Math.min(start, end), Math.max(start, end))
          }
          // A quick tap (long-press never fired) intentionally does
          // nothing on touch — translating requires a hold. Always swallow
          // the trailing click either way: touch never drives a commit
          // through onClick, keeping it fully owned by this pointer state
          // machine rather than depending on the browser's tap-vs-scroll
          // resolution.
          suppressNextClick.current = true
          repaint()
          return
        }
        if (!isDragging.current) return
        isDragging.current = false
        if (!dragMoved.current) return
        const start = startRef.current
        const end = endRef.current
        if (start === null || end === null) return
        commit(Math.min(start, end), Math.max(start, end))
        suppressNextClick.current = true
      },
      onPointerCancel: (event) => {
        if (event.pointerType !== 'touch') return
        if (touchPointerId.current !== event.pointerId) return
        resetTouchGesture()
        repaint()
      },
      onClick: () => {
        if (suppressNextClick.current) {
          suppressNextClick.current = false
          return
        }
        commit(globalIndex, globalIndex)
      },
    }),
    [commit, repaint, clearLongPressTimer, resetTouchGesture, triggerPulse],
  )

  const onPointerLeave = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    dragMoved.current = false
    repaint()
  }, [repaint])

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (event.pointerType !== 'touch') return
      if (touchPointerId.current === null || event.pointerId !== touchPointerId.current) return

      if (!isTouchSelecting.current) {
        // Already decided this is a scroll: leave it entirely to the
        // browser's native pan-y handling, no JS involvement.
        if (isScrolling.current) return
        const dx = event.clientX - touchStartX.current
        const dy = event.clientY - touchStartY.current
        if (Math.hypot(dx, dy) > TOUCH_MOVE_CANCEL_THRESHOLD_PX) {
          clearLongPressTimer()
          isScrolling.current = true
        }
        return
      }

      event.preventDefault()
      scheduleHitTest(event.clientX, event.clientY)
    },
    [clearLongPressTimer, scheduleHitTest],
  )

  useEffect(() => {
    return () => {
      clearLongPressTimer()
      if (pulseTimeout.current !== null) clearTimeout(pulseTimeout.current)
      if (hitTestFrame.current !== null) cancelAnimationFrame(hitTestFrame.current)
    }
  }, [clearLongPressTimer])

  // Derived during render — the committed set (controlled prop takes
  // precedence over the hook's own) with the live drag/selection range layered
  // on top, so existing selections stay highlighted while a new one is dragged.
  const committedSelected = selectedIndices ?? committed
  const isLiveRange =
    (isDragging.current || isTouchSelecting.current) &&
    startRef.current !== null &&
    endRef.current !== null

  const effectiveSelected = isLiveRange
    ? new Set([
        ...committedSelected,
        ...rangeToSet(
          Math.min(startRef.current!, endRef.current!),
          Math.max(startRef.current!, endRef.current!),
        ),
      ])
    : committedSelected

  return {
    getWordProps,
    selectedIndices: effectiveSelected,
    containerProps: { onPointerLeave, onPointerMove },
    pulseIndex,
  }
}
