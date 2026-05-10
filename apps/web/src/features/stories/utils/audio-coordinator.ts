const players = new Map<number, HTMLAudioElement>()

export function registerPlayer(id: number, el: HTMLAudioElement): () => void {
  players.set(id, el)
  return () => {
    if (players.get(id) === el) players.delete(id)
  }
}

export function pauseOthers(currentId: number): void {
  for (const [id, el] of players) {
    if (id !== currentId) el.pause()
  }
}
