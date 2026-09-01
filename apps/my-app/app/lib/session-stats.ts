const commandCountKey = 'kelev-command-count'
const snakeBestKey = 'kelev-snake-best'

export type SessionStats = {
  commands: number
  snakeBest: number
}

function readCount(key: string) {
  try {
    const stored = Number(window.sessionStorage.getItem(key))
    return Number.isFinite(stored) && stored > 0 ? Math.floor(stored) : 0
  } catch {
    return 0
  }
}

function writeCount(key: string, value: number) {
  try {
    window.sessionStorage.setItem(key, String(value))
  } catch {
    // sessionStorage can be unavailable in private windows; the stats are decorative
  }
}

export function readSessionStats(): SessionStats {
  return { commands: readCount(commandCountKey), snakeBest: readCount(snakeBestKey) }
}

export function countCommand() {
  writeCount(commandCountKey, readCount(commandCountKey) + 1)
}

export function recordSnakeScore(score: number) {
  if (score > readCount(snakeBestKey)) writeCount(snakeBestKey, score)
}
