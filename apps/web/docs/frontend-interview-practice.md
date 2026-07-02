# Frontend interview practice, anchored to `apps/web`

A working catalogue that pairs GreatFrontend-style (GFE75) interview problems and the
React knowledge round with **real improvements to this site**. The idea: instead of
grinding throwaway exercises, each item here is a change worth shipping *and* a topic you
can build or explain in an interview.

## How to use this

Work top to bottom — Priority 1 is highest value for both the site and interview prep.
Each entry is tagged:

- **[Improve]** — worth changing in the codebase; the exercise ships something useful.
- **[Explain]** — the pattern already exists here; no code change, just be ready to
  articulate it against real code.

Each entry follows the same shape: **Topic** (the interview problem) · **Where** (real
code) · **Why it helps the site** · **Interview framing** (what to build/explain from
scratch) · **Approach & reuse** · **Effort**.

Conventions when you implement: British English in copy, full stops rather than
exclamation marks, and any meaningful numeric literal (a throttle interval, a page size)
lives in a named constant rather than a magic default.

Links use paths relative to this doc (`../src/...`), so they open from here in the editor.


| # | Item | Topic | Tag | Site value | Effort |
|---|------|-------|-----|------------|--------|
| 1 | Throttle transcript re-renders | `throttle` + hook | Improve | High | S–M |
| 2 | Fix translation-fetch race | Async race / cancellation | Improve | High | S–M |
| 3 | Memoise transcript derived data | `useMemo` | Improve | Medium | S |
| 3b | Colocate `currentTime` state | State colocation / selectors | Improve | Medium | M |
| 4 | Reuse `cn()` for class joins | `classNames` / `clsx` | Improve | Low | S |
| 5 | Reusable drag-to-select hook | Text selection, pointer events | Improve | Medium | M |
| 6 | Audio coordinator → event emitter | Event Emitter / observer | Improve | Medium | M |
| 7 | Accessible mobile drawer | Modal / Dialog a11y | Improve | High | M |
| 8 | Debounced story search | Autocomplete + `debounce` | Improve | High | M |
| 9 | Infinite scroll for lists | Infinite scroll / `IntersectionObserver` | Improve | Medium | M |
| 10 | FAQ / level accordion | Accordion | Improve | Medium | S–M |
| 11 | Custom seek / progress bar | Progress bar / slider | Improve | Medium | M |
| — | Star rating, like button, carousel | Various | Improve (backend) | Optional | M–L |
| — | React fundamentals | Hooks / optimisation round | Explain | — | — |

---

## Priority 1 — real bugs and perf wins that are textbook problems

### 1. Throttle the video `timeupdate` → transcript re-render — [Improve]

> This item is also the worked example for the **[Deep dive: how React re-renders work &
> optimising a slow page](#deep-dive-how-react-re-renders-work--optimising-a-slow-page)**
> below — one of the most common React interview questions.

- **Topic**: `throttle`, then wrapped as a `useThrottledCallback` hook.
- **Where**: [video-player.tsx L64-66](../src/features/stories/components/video-player.tsx#L64-L66)
  fires `onTimeUpdate` on every video.js `timeupdate` event (~4 times a second).
  [story-details.tsx L158](../src/features/stories/components/story-details.tsx#L158)
  feeds it straight into `setCurrentTime`, which re-renders the whole
  [transcript-display.tsx](../src/features/stories/components/transcript-display.tsx) —
  and that component `flatMap`s every word and rebuilds every `<span>` on each tick.
- **Why it helps the site**: the story page is the busiest screen; throttling the time
  updates removes most of that render churn. Active-word highlighting only needs
  roughly 100–150ms resolution to look continuous, so throttle at a named constant such
  as `TIME_UPDATE_THROTTLE_MS`.
- **Interview framing**: implement a leading/trailing `throttle` from first principles,
  then the React-hook version that survives re-renders (stale closures) and cleans up its
  timer on unmount. Be ready to contrast **throttle vs debounce vs `requestAnimationFrame`**
  — for a steady stream of updates you want throttle or rAF, not debounce.
- **Approach & reuse**: add `lib/throttle.ts` (pure) plus `hooks/use-throttled-callback.ts`;
  wrap the `onTimeUpdate` handler. Add a Vitest test for the pure function with fake timers.
- **Effort**: S–M.

### 2. Fix the translation-fetch race condition — [Improve]

- **Topic**: async correctness — handling out-of-order responses / cancellation.
- **Where**: [story-details.tsx L69-116](../src/features/stories/components/story-details.tsx#L69-L116) —
  `handlePhraseSelect` calls `await translatePhrase(...)` with no guard. Select phrase A
  then quickly phrase B: if A's request resolves last, it overwrites B's panel with stale
  data.
- **Why it helps the site**: the translation panel always matches the phrase you selected.
  Caching by phrase additionally avoids re-translating something you already looked up.
- **Interview framing**: this is the classic "last write wins" async bug. Solutions to
  discuss: a monotonically increasing request token compared on resolve; an
  `AbortController` cancelling the previous request; or lifting the fetch into React Query
  keyed on the phrase, which dedupes and caches for free. Explain the trade-offs.
- **Approach & reuse**: `translatePhrase` lives in
  [api.ts L17-27](../src/features/stories/api.ts#L17-L27); React Query is already wired up
  ([root-provider.tsx](../src/integrations/tanstack-query/root-provider.tsx)). Either
  extract a `useLatestAsync` / `useAbortableAsync` hook, or convert the call to a keyed
  `useQuery` enabled when a Spanish phrase is selected.
- **Effort**: S–M.

### 3. Memoise the transcript's derived data — [Improve]

- **Topic**: `useMemo` for expensive derived data under frequent re-renders.
- **Where**: [transcript-display.tsx L361-369](../src/features/stories/components/transcript-display.tsx#L361-L369) —
  `allWords = sections.flatMap(...)` and the `sectionOffsets` loop run on **every** render,
  and this component re-renders on every `timeupdate` tick (see item 1).
- **Why it helps the site**: the direct partner to item 1. `allWords` and `sectionOffsets`
  depend only on `transcription`, so a `useMemo` keyed on `[transcription]` stops rebuilding
  them several times a second. Together, items 1 and 3 remove the bulk of the per-tick work.
- **Interview framing**: explain what `useMemo` actually caches, why referential stability
  matters, and when it is a net loss (cheap computations, unstable deps). Contrast with the
  cheap `STORY_LEVELS.find(...)` lookups elsewhere that should **not** be memoised.
- **Approach & reuse**: wrap the two derivations in `useMemo`. No new dependencies.
- **Effort**: S.

### 3b. Colocate `currentTime` so only the transcript re-renders — [Improve]

- **Topic**: state colocation ("lift state down"), and the *blast radius* of a re-render.
  Pairs directly with the Context-vs-Zustand-selectors fundamental below.
- **Where**: `currentTime` is `useState` in
  [story-details.tsx L30](../src/features/stories/components/story-details.tsx#L30), set from
  `onTimeUpdate` at [L158](../src/features/stories/components/story-details.tsx#L158), but its
  only consumer is the `TranscriptDisplay` at
  [L207-212](../src/features/stories/components/story-details.tsx#L207-L212). Because the state
  lives in `StoryDetails`, every tick also re-renders the video wrapper, breadcrumb, title,
  downloads and the switches — none of which use the value.
- **Why it helps the site**: this is the deepest lever on the optimisation ladder. Keeping
  `currentTime` local to the transcript shrinks each tick's re-render to just the words that
  need it, and it composes with the throttle (item 1) and the memoisation (item 3) rather than
  replacing them.
- **Interview framing**: colocation — keep high-frequency state as low in the tree as
  possible; the alternative of publishing `currentTime` through a small external store
  (Zustand) or `context` + selector so only subscribers re-render (the same principle as the
  Zustand item below); and, as the most aggressive option, driving the highlight imperatively
  through a ref so the value never becomes React state at all. Discuss the trade-offs
  (prop-drilling vs store vs context; readability vs raw performance).
- **Approach & reuse**: lift the `VideoPlayer` + transcript coordination into a small wrapper
  whose only job is the time → highlight link, so the surrounding chrome sits outside the
  re-rendering subtree; or publish `currentTime` via a tiny Zustand store the words read with
  selectors. The `VideoPlayerHandle` / `onTimeUpdate` contract already exists
  ([video-player.tsx L20-36, L64-66](../src/features/stories/components/video-player.tsx#L20-L36)).
- **Effort**: M.

### Deep dive: how React re-renders work & optimising a slow page

Items 1 and 3 are the worked example for a question that comes up constantly: *"this page
feels slow — how do you work out why, and how do you fix it?"*. The story page is a real,
honest example, so use it to rehearse the answer.

**The mental model.** A component re-renders when one of three things happens: its own
state changes, its parent re-renders, or a context it reads changes. Two things people
conflate but should keep separate:

- *Render* — React calls your component function and reconciles the result against the
  previous tree. This is plain JavaScript.
- *Commit / paint* — React applies the minimal DOM changes it found, and the browser
  paints.

A re-render is **not** automatically a DOM update. On this page the expensive part is the
render itself — [transcript-display.tsx L361-369](../src/features/stories/components/transcript-display.tsx#L361-L369)
`flatMap`s every word and rebuilds every `<span>` — not the DOM, which barely changes
between ticks.

**The concrete trace.** video.js fires `timeupdate` about four times a second
([video-player.tsx L64-66](../src/features/stories/components/video-player.tsx#L64-L66)) →
`setCurrentTime` in [story-details.tsx L158](../src/features/stories/components/story-details.tsx#L158) →
`StoryDetails` re-renders → its whole subtree re-renders, including the transcript, which
recomputes its derived data on every tick. That is the churn we want to remove.

**Diagnosis workflow (say this out loud in an interview).**

1. Open the React DevTools **Profiler**, record a few seconds of playback.
2. Turn on **"Highlight updates when components render"** to see what flashes and how often.
3. Identify the state driving it (`currentTime`) and its frequency (~4/sec).
4. Apply the cheapest effective fix, then **re-measure** to confirm.

**The optimisation ladder** — reach for these roughly in order:

1. **Re-render less often** — throttle the source (item 1). Fewest moving parts, biggest win here.
2. **Move state down / colocate** — `currentTime` currently lives high in `StoryDetails`,
   so every tick also re-renders the video wrapper, the breadcrumb and the switches. Pushing
   the "which word is active" calculation into a smaller subtree (or exposing `currentTime`
   through a store/subscription that only the words read) shrinks the blast radius. This is
   the architecturally cleaner fix and a strong thing to talk through, even if you ship the
   throttle first. Formalised as item 3b above.
3. **Memoise expensive derived data** — `useMemo` for `allWords` / `sectionOffsets` (item 3).
4. **Memoise components** — `React.memo` on children plus stable props via `useCallback`.
   Be honest about when it does *not* help: each transcript section depends on `currentTime`
   for highlighting, so memoising the sections buys little unless you first narrow what each
   one receives.
5. **Mark non-urgent updates** — `useDeferredValue` / `startTransition` let React keep the
   UI responsive by rendering a heavy update at lower priority. Overkill here, but worth
   naming as the next tool.

**The trade-off to mention.** Throttle interval versus highlight smoothness: too long and
the active word lags the audio, too short and you keep the churn. That is exactly why the
interval is a named constant (`TIME_UPDATE_THROTTLE_MS`) you can tune, not a magic number.

**Answer skeleton (memorise this).** *Measure → find the state and how often it changes →
apply the cheapest effective lever (re-render less, move state down, memoise) → re-measure.*
Everything above is just filling in that sentence.

### 4. Reuse `cn()` instead of inline `[...].filter(Boolean).join(' ')` — [Improve]

- **Topic**: the `classNames` / `clsx` utility.
- **Where**: the `[...].filter(Boolean).join(' ')` pattern repeats around four times in
  [transcript-display.tsx](../src/features/stories/components/transcript-display.tsx)
  (for example L91-99, L197-211, L302-310).
- **Why it helps the site**: less duplication, and `cn` also resolves conflicting Tailwind
  classes via `tailwind-merge`, which the manual join does not.
- **Interview framing**: implement `classNames` from scratch (strings, arrays, objects with
  truthy values), then explain what `clsx` and `tailwind-merge` each add on top.
- **Approach & reuse**: `cn()` already exists at [utils.ts L5-7](../src/lib/utils.ts#L5-L7).
  Swap the inline joins for `cn(...)`.
- **Effort**: S.

---

## Priority 2 — refactors that improve maintainability and are strong "explain the pattern" topics

### 5. Extract a reusable drag-to-select hook and de-duplicate the transcript — [Improve]

- **Topic**: text / range selection, pointer events, controlling re-renders with refs.
- **Where**: the `onMouseDown` / `onMouseEnter` / `onMouseUp` handlers plus
  `selectionStartRef`, `selectionEndRef`, `isDragging` and the `forceUpdate` trick are
  copy-pasted across the vocabulary, verbs and default renderers in
  [transcript-display.tsx](../src/features/stories/components/transcript-display.tsx).
- **Why it helps the site**: one `useDragSelect` hook plus a single `SelectableWord`
  component removes triplicated, bug-prone logic. Crucially, **switch to pointer events so
  selection works on touch devices** — today it is mouse-only, so phrase lookup is broken on
  phones and tablets, a real gap.
- **Interview framing**: model a drag as a small state machine (idle → dragging → committed);
  explain why refs plus a single forced render beat storing every intermediate index in
  state; handle drags that end outside the element via a global `pointerup` listener.
- **Approach & reuse**: new `hooks/use-drag-select.ts` returning the live selection set and
  handlers; render each word through one `SelectableWord`. Reuse the existing
  `onPhraseSelect` contract so `StoryDetails` is untouched.
- **Effort**: M.

### 6. Refactor `audio-coordinator.ts` into a typed event emitter — [Improve]

- **Topic**: Event Emitter / observer pattern.
- **Where**: [audio-coordinator.ts](../src/features/stories/utils/audio-coordinator.ts) is a
  module-level `Map` plus a **global `order` array** (L7) that whichever list mounts last
  overwrites — a latent cross-page bug. It is consumed by
  [story-audio-row.tsx L40-53](../src/features/stories/components/story-audio-row.tsx#L40-L53)
  and the `onEnded` / `onPlay` handlers around L130.
- **Why it helps the site**: a small typed emitter (`on` / `off` / `emit`) plus a scoped
  `useMediaCoordinator` makes single-play and autoplay-next testable and removes the
  shared-global footgun.
- **Interview framing**: implement a generic `EventEmitter<Events>` with typed events and
  subscription cleanup; explain the observer pattern and why forgetting to unsubscribe leaks.
- **Approach & reuse**: new `lib/event-emitter.ts` (pure, unit-tested) backing a rewritten
  coordinator; keep the `registerPlayer` / `pauseOthers` / `playNext` surface stable so
  callers barely change.
- **Effort**: M.

### 7. Make the mobile translation drawer accessible — [Improve]

- **Topic**: Modal / Dialog accessibility.
- **Where**: the hand-rolled off-canvas drawer in
  [story-details.tsx L215-262](../src/features/stories/components/story-details.tsx#L215-L262) —
  no Escape-to-close, no focus trap, no focus restore, no `role="dialog"` / `aria-modal`.
  Body scroll-lock is done inline at
  [L59-67](../src/features/stories/components/story-details.tsx#L59-L67).
- **Why it helps the site**: a genuine accessibility and keyboard-UX improvement. The same
  pattern would also tidy the header's mobile menu at
  [header.tsx L86-108](../src/components/header.tsx#L86-L108).
- **Interview framing**: focus trap, Escape handling, scroll-lock, restoring focus to the
  trigger on close, and `inert` / `aria-modal` for the background. Build the trap from
  scratch as the exercise, or justify adopting the Radix Dialog already used in
  [auth-menu.tsx](../src/components/auth-menu.tsx).
- **Approach & reuse**: extract `useScrollLock`, `useEscapeKey`, `useOnClickOutside` and
  `useFocusTrap`, then compose them into the drawer (and reuse for the header menu).
- **Effort**: M.

---

## Priority 3 — net-new UI the site genuinely benefits from

### 8. Debounced story search / typeahead — [Improve]

- **Topic**: Autocomplete + `debounce`.
- **Where**: the home page ([index.tsx L42-58](../src/routes/index.tsx#L42-L58)) and level
  pages ([$levelSlug.tsx L108-139](../src/routes/stories/$levelSlug.tsx#L108-L139)) list
  every story with no way to filter.
- **Why it helps the site**: a client-side filter over the already-loaded stories (by
  `title` / `altTitle`) is a real usability win as the catalogue grows — no backend needed.
- **Interview framing**: debounce the input, keep it controlled, add keyboard navigation of
  the results (arrow keys, Enter, Escape), wire up ARIA combobox roles, and highlight the
  matched substring.
- **Approach & reuse**: new `hooks/use-debounce.ts`; the story data is already in React
  Query cache, so the filter is pure client-side.
- **Effort**: M.

### 9. Infinite scroll (or load-more) for story lists — [Improve]

- **Topic**: Infinite scroll with `IntersectionObserver`.
- **Where**: [story-list.tsx](../src/features/stories/components/story-list.tsx) and
  [story-row-list.tsx](../src/features/stories/components/story-row-list.tsx) render every
  item at once.
- **Why it helps the site**: lower initial render cost and DOM size as the catalogue grows.
- **Interview framing**: the `IntersectionObserver` sentinel pattern, and `useInfiniteQuery`
  if the API paginates. **Decision to make**: chunk client-side over the already-loaded list
  (simple, no API change) versus true server pagination (needs an API change) — note which
  you chose and why.
- **Approach & reuse**: new `hooks/use-intersection-observer.ts`; render an incrementally
  growing slice, or `useInfiniteQuery` if you extend the API.
- **Effort**: M.

### 10. FAQ / level accordion on "How it works" — [Improve]

- **Topic**: Accordion.
- **Where**: [how-it-works.tsx L51-90](../src/routes/how-it-works.tsx#L51-L90) already renders
  the four levels as a static stacked list — accordion-shaped already.
- **Why it helps the site**: an accessible accordion plus a real FAQ section is a content and
  SEO win (FAQ blocks are featured-snippet friendly, which fits the SEO backlog).
- **Interview framing**: `aria-expanded` / `aria-controls`, full keyboard support, single-
  versus multi-open behaviour, and animating height without layout jank.
- **Approach & reuse**: a small `Accordion` component; optionally add `FAQPage` JSON-LD to
  the route `head` alongside the existing structured data for SEO.
- **Effort**: S–M.

### 11. Custom seek / progress bar synced to the transcript — [Improve]

- **Topic**: Progress bar / slider.
- **Where**: playback already exposes `currentTime` (via `onTimeUpdate`) and `seekTo` —
  [video-player.tsx L32-36](../src/features/stories/components/video-player.tsx#L32-L36),
  consumed in [story-details.tsx](../src/features/stories/components/story-details.tsx).
- **Why it helps the site**: a slim, click-to-seek progress bar above the transcript
  reinforces the read-along experience beyond the video.js scrubber.
- **Interview framing**: a controlled slider, pointer drag, the ARIA slider role and keyboard
  support, and mapping value to and from pixel offsets.
- **Approach & reuse**: reuse `VideoPlayerHandle.seekTo` and the throttled `currentTime` from
  item 1 to drive the fill.
- **Effort**: M.

---

## Priority 4 — optional builds (note the dependency)

- **Star rating** (GFE Star Rating) — social proof and difficulty feedback. Needs a backend
  endpoint, so build the UI first (hover, keyboard, half-stars) and stub the mutation.
- **Save / favourite "like" button** (GFE Like Button) — an optimistic React Query mutation
  to bookmark stories; an account page already exists at
  [account.tsx](../src/routes/_authed/account.tsx). Needs a backend endpoint.
- **Carousel** (GFE Image Carousel) — carousels are debatable UX. The safer win is adding
  scroll-snap and keyboard navigation to the existing
  [level-progression-panel.tsx](../src/features/stories/components/level-progression-panel.tsx),
  which is already a horizontal thumbnail strip.

---

## React fundamentals — anchored to real code

The interview "React knowledge" round. Each concept is pinned to a concrete spot so you can
explain it against this codebase, and applied where marked **[Improve]**.

### `useMemo` — [Improve] / [Explain]

- **Apply**: item 3 (memoise `allWords` / `sectionOffsets`).
- **Explain**: what it caches, referential stability, and when it is a net loss. Contrast the
  cheap `STORY_LEVELS.find(...)` lookups at
  [story-details.tsx L121](../src/features/stories/components/story-details.tsx#L121) and
  [story-audio-row.tsx L37](../src/features/stories/components/story-audio-row.tsx#L37) that
  should **not** be memoised.

### `useCallback` + `React.memo` — [Improve] / [Explain]

- **Where**: handlers passed down as props — `onPhraseSelect={handlePhraseSelect}` and
  `onTimeUpdate={setCurrentTime}` in
  [story-details.tsx L158-210](../src/features/stories/components/story-details.tsx#L158-L210);
  `TranscriptSectionComponent` re-renders on every tick
  ([transcript-display.tsx L398-412](../src/features/stories/components/transcript-display.tsx#L398-L412)).
- **Explain**: `useCallback` only pays off when the child is `React.memo`'d — the two go
  together. A good honest answer here: memoising the sections helps little because each
  depends on `currentTime` for highlighting, so this is a "when memo does **not** help"
  example unless you narrow what each section receives.

### `useRef` vs `useState` — [Explain]

- **Where**: the transcript deliberately drives drag state through refs plus a single
  `forceUpdate` at
  [transcript-display.tsx L355-374](../src/features/stories/components/transcript-display.tsx#L355-L374)
  to avoid a re-render on every pointer move.
- **Explain**: refs hold mutable values without triggering renders; why that fits a
  high-frequency drag; and the manual `forceUpdate` escape hatch for the moments you *do*
  want a paint.

### The "latest ref" pattern (stale closures) — [Explain]

- **Where**: [video-player.tsx L27-30](../src/features/stories/components/video-player.tsx#L27-L30)
  mirrors `onEnded` / `startSeconds` into refs so the long-lived video.js callbacks always
  read fresh values without re-subscribing;
  [story-audio-row.tsx L30, L63](../src/features/stories/components/story-audio-row.tsx#L30-L63)
  does the same for `handleLoadAndPlay`.
- **Explain**: why the effect deps `[videoUrl, autoPlay]` intentionally omit the callbacks,
  and how the ref sidesteps stale-closure bugs.

### `useEffect` — dependencies, cleanup, "sync an external system" — [Explain]

- **Where**: the DOM-sync effects for volume / muted
  ([story-audio-row.tsx L55-61](../src/features/stories/components/story-audio-row.tsx#L55-L61)),
  the registration effect that returns its unsubscribe
  ([story-audio-row.tsx L40-45](../src/features/stories/components/story-audio-row.tsx#L40-L45)),
  and the video.js dispose-on-unmount effect
  ([video-player.tsx L96-105](../src/features/stories/components/video-player.tsx#L96-L105)).
- **Explain**: effects as synchronisation with an external system, cleanup functions, and
  reading the dependency array honestly.

### `useImperativeHandle` + `forwardRef` — [Explain]

- **Where**: [video-player.tsx L20-36](../src/features/stories/components/video-player.tsx#L20-L36)
  exposes a `seekTo` method to the parent, called from `handlePhraseSelect`.
- **Explain**: exposing a small imperative API from a component, and why it is used sparingly
  in an otherwise declarative tree.

### Context vs external store (Zustand selectors) — [Explain]

- **Where**: `usePreferencesStore((s) => s.audioVolume)` selector subscriptions throughout
  ([preferences.ts](../src/stores/preferences.ts)).
- **Explain**: the classic Context re-render pitfall (every consumer re-renders on any value
  change) and how a selector-based store subscribes to a single slice instead — the reason
  this app reaches for Zustand.

### Keys and reconciliation — [Explain]

- **Where**: `key={story.videoLink}` forces a full remount of the player when the video
  changes ([story-details.tsx L155](../src/features/stories/components/story-details.tsx#L155));
  index keys (`key={i}`) appear in the transcript
  ([transcript-display.tsx L398](../src/features/stories/components/transcript-display.tsx#L398)).
- **Explain**: how keys drive reconciliation, using a key to intentionally reset component
  state, and the index-key pitfall for reorderable lists.

### Suspense + data fetching — [Explain]

- **Where**: `useSuspenseQuery` on the home page
  ([index.tsx L42-43](../src/routes/index.tsx#L42-L43)) with a route `loader` prefetch.
- **Explain**: Suspense for data, loader-driven prefetch to avoid waterfalls, and how this
  fits SSR streaming with TanStack Start.

---

## Shared hooks and utils to extract (the JS + hooks rounds)

These back several items above and remove real duplication. Each is a classic interview
warm-up on its own:

- `lib/debounce.ts`, `lib/throttle.ts` (pure) plus `hooks/use-debounce.ts`,
  `hooks/use-throttled-callback.ts`.
- `hooks/use-boolean.ts` (a toggle) — for `sidebarOpen`, `menuOpen` and other booleans.
- `hooks/use-media-query.ts` — `window.matchMedia('(min-width: 768px)')` is inlined at
  [story-details.tsx L60](../src/features/stories/components/story-details.tsx#L60) and in
  [preferences.ts](../src/stores/preferences.ts).
- `hooks/use-on-click-outside.ts`, `hooks/use-event-listener.ts`, `hooks/use-escape-key.ts`,
  `hooks/use-focus-trap.ts`, `hooks/use-scroll-lock.ts`.
- Reuse `cn()` wherever an inline class-join appears.

---

## Working through an item

There are currently no tests, though Vitest and Testing Library are installed — so the pure
utilities below are also the natural first unit tests.

- Types and lint: `pnpm --filter @real-spanish-stories/web typecheck` and
  `pnpm --filter @real-spanish-stories/web lint`.
- Tests for pure utilities (throttle, debounce, event emitter, `cn`):
  `pnpm --filter @real-spanish-stories/web test`.
- Manual check for item 1: open a story and confirm word highlighting still tracks playback
  while the transcript re-renders far less often (watch the React DevTools Profiler).
