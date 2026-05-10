interface RegisteredPlayer {
  el: HTMLAudioElement
  triggerPlay: () => void
}

const players = new Map<number, RegisteredPlayer>()
let order: number[] = []

export function registerPlayer(
  id: number,
  el: HTMLAudioElement,
  triggerPlay: () => void = () => {},
): () => void {
  players.set(id, { el, triggerPlay })
  return () => {
    if (players.get(id)?.el === el) players.delete(id)
  }
}

export function setOrder(ids: number[]): void {
  order = ids
}

export function pauseOthers(currentId: number): void {
  for (const [id, { el }] of players) {
    if (id !== currentId) el.pause()
  }
}

export function playNext(currentId: number): void {
  const idx = order.indexOf(currentId)
  if (idx < 0 || idx >= order.length - 1) return
  const nextId = order[idx + 1]
  players.get(nextId)?.triggerPlay()
}
