export function createSlug(altTitle: string, level: string): string {
  const titlePart = altTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return `${titlePart}-${level}-spanish`
}
