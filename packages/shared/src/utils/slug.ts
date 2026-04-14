export function levelToParam(level: string): string {
  return level.replace(/_/g, '-')
}

export function paramToLevel(param: string): string {
  return param.replace(/-/g, '_')
}

export function createSlug(altTitle: string, level: string): string {
  const titlePart = altTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  const levelPart = levelToParam(level)
  return `${titlePart}-${levelPart}-spanish`
}
