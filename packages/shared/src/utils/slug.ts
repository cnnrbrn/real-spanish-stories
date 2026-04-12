export function createSlug(altTitle: string, level: string): string {
  const titlePart = altTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  const levelPart = level.replace(/_/g, '-') // "just_starting" → "just-starting"
  return `${titlePart}-${levelPart}-spanish`
}
