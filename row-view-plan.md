# Row view for level pages — slim plan

## Context

Today level pages (`/stories/just-starting-spanish-stories`, etc.) render stories as a grid of cards linking to the story detail page. The user wants the **default** layout there to be a vertical row list where each story has its own inline audio player, with a switch to make playback advance through the list automatically. A button toggles back to the existing grid.

This plan is the **slim** version. Earlier drafts included sort, a "log in to track progress" notice, and full progress-tracking — all dropped here. Premium-audio gating is also deferred: there's no premium content yet and no billing in place. Anonymous users get the existing grid-style fallback if we end up rendering rows for them, but inline play requires login.

## Policy summary

| User state | Inline play |
|---|---|
| Anonymous | Click play → opens login modal (same pattern as the PDF download buttons in [apps/web/src/features/stories/components/story-downloads.tsx](apps/web/src/features/stories/components/story-downloads.tsx)) |
| Logged in | Can play any audio |
| Subscribed (future) | Same as logged-in for now; premium gate added when Polar billing lands |

Audio download (separate from inline play) keeps the existing 2/day rate limit on `/stories/:id/audio`. Inline play does **not** consume that quota — it goes through a new endpoint.

## Phases

### Phase 1 — backend

**1a. Expose audio availability on the list endpoint.**
The list endpoint at [apps/api/src/features/stories/get-stories/get-stories.handler.ts](apps/api/src/features/stories/get-stories/get-stories.handler.ts) doesn't currently project audio. Each row in the new view needs to know whether audio exists for that story.

- Add `audioFilename: z.string().nullable()` to `storySchema` in [packages/shared/src/schemas/story.schema.ts](packages/shared/src/schemas/story.schema.ts) (it already lives in `storyDetailSchema`; promote to base).
- Remove the now-redundant `audioFilename` line from `storyDetailSchema.extend(...)` since it inherits.
- Project `audioFilename` in the `get-stories` handler's SELECT.
- Client check is `story.audioFilename != null`.
- Rebuild shared: `pnpm --filter @real-spanish-stories/shared build`.

**1b. New `/stories/:id/play` endpoint.**
Login-gated, returns `{ url }` (presigned S3 URL). No rate limit (this is for streaming, not download). 60s TTL — same as the download URL.

- New CQRS folder `apps/api/src/features/stories/request-audio-play/`.
- `RequestAudioPlayCommand(userId, storyId)` + handler.
- Handler looks up the story, 404 if no `audioPath`, returns presigned URL via `storageService.getPresignedUrl(audioPath, PRESIGNED_AUDIO_URL_TTL_SECONDS)`. No rate-limit check.
- Controller route in [apps/api/src/features/stories/stories.controller.ts](apps/api/src/features/stories/stories.controller.ts): `@Get(":id/play")` requires `@Session()`, returns `{ url }`.
- Register the handler in [stories.module.ts](apps/api/src/features/stories/stories.module.ts).

**Verification:** logged in, hit `GET /stories/:id/play` → `{ url: "https://...s3..." }`. Logged out → 401. Hit the URL in a browser → audio bytes.

### Phase 2 — row view + grid toggle

- Extend [apps/web/src/stores/preferences.ts](apps/web/src/stores/preferences.ts):
  - `levelViewMode: 'row' | 'grid'`, default `'row'`.
  - Setter.
- New components in [apps/web/src/features/stories/components/](apps/web/src/features/stories/components/):
  - `story-row-list.tsx` — wrapper that renders a `StoryAudioRow` per story.
  - `story-audio-row.tsx` — single-row card: thumbnail, linked title, level badge, audio player (see below).
  - `story-view-toggle.tsx` — grid/row icon button that flips `levelViewMode`.
- In [apps/web/src/routes/stories/$levelSlug.tsx](apps/web/src/routes/stories/$levelSlug.tsx) only (NOT the home page):
  - Render `<StoryViewToggle />` above the list.
  - Render `<StoryRowList />` or the existing `<StoryList />` based on `levelViewMode`.
- Existing grid path stays untouched.

**Audio player in `StoryAudioRow`**
- Native `<audio ref controls>`, with `src` initially empty.
- Custom play button overlay (or rely on the native control with a click interceptor — TBD during implementation).
- On user-initiated play:
  - If no session → call `openLogin({ headline: "Log in to play. It's free." })` from [apps/web/src/stores/auth-modals.ts](apps/web/src/stores/auth-modals.ts).
  - Otherwise: `fetch(\`${VITE_API_URL}stories/${id}/play\`, { credentials: 'include' })` → JSON `{ url }` → `audioRef.current.src = url; audioRef.current.play()`.
- A toast on failure (we have `sonner` from the download work).
- Single-player coordination: when a row starts playing, pause all other rows. Lightweight registry via Zustand or a module-level ref.

**Verification:** load `/stories/just-starting-spanish-stories` while logged in, see rows. Click play on row 1 → audio plays. Click play on row 3 → row 1 pauses, row 3 plays. Logged out → click play → login modal appears. Toggle to grid → existing grid renders. Reload → view persisted.

### Phase 3 — autoplay switch

- Add `levelAutoplay: boolean` to the preferences store, default **off**.
- New `<Switch>` UI primitive (Radix `@radix-ui/react-switch` is already in the deps tree under `radix-ui`).
- New `story-autoplay-switch.tsx` placed alongside the view toggle.
- In `StoryAudioRow`, on `'ended'` event: if `levelAutoplay` is on, look up the next row in DOM order and trigger its play. The coordinator handles pausing the current and starting the next, scrolling the next into view.
- Highlight the currently-playing row with a subtle left-border in the level colour.

**Verification:** turn the switch on, click play on row 1, audio finishes → row 2 starts. Switch off → audio just stops.

## Critical files

| File | Role |
|---|---|
| [packages/shared/src/schemas/story.schema.ts](packages/shared/src/schemas/story.schema.ts) | Promote `audioFilename` to base `storySchema` (Phase 1a) |
| [apps/api/src/features/stories/get-stories/get-stories.handler.ts](apps/api/src/features/stories/get-stories/get-stories.handler.ts) | Project `audioFilename` (Phase 1a) |
| `apps/api/src/features/stories/request-audio-play/` | **New** — CQRS command + handler (Phase 1b) |
| [apps/api/src/features/stories/stories.controller.ts](apps/api/src/features/stories/stories.controller.ts) | Add `/play` route (Phase 1b) |
| [apps/api/src/features/stories/stories.module.ts](apps/api/src/features/stories/stories.module.ts) | Register the new handler |
| [apps/web/src/stores/preferences.ts](apps/web/src/stores/preferences.ts) | Add `levelViewMode`, `levelAutoplay` |
| `apps/web/src/features/stories/components/story-row-list.tsx` | **New** |
| `apps/web/src/features/stories/components/story-audio-row.tsx` | **New** |
| `apps/web/src/features/stories/components/story-view-toggle.tsx` | **New** |
| `apps/web/src/features/stories/components/story-autoplay-switch.tsx` | **New** (Phase 3) |
| [apps/web/src/routes/stories/$levelSlug.tsx](apps/web/src/routes/stories/$levelSlug.tsx) | Branch between row/grid + render toggle |

## Deferred (not in this plan)

- Sort toggle (newest/oldest).
- "Log in to track progress" notice.
- Progress tracking (DB table, API, heartbeat).
- Premium-audio gating — needs Polar billing first.
- Custom audio controls / Spotify-like player — native `<audio controls>` is enough for v1.
