// Format a news date (YYYY-MM-DD) as e.g. "2 July 2026". Mirrors the web's
// formatNewsDate (apps/web/src/features/news/utils/date.ts) so every surface agrees.
function formatNewsDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

// Reduce a label to a safe, readable filename component: fold accents (á→a,
// ñ→n) by decomposing then dropping the combining marks along with any other
// non-ASCII, remove filesystem-illegal chars, and collapse whitespace. Keeps
// spaces and hyphens (valid ASCII in a quoted Content-Disposition filename).
function sanitiseForFilename(label: string): string {
  return label
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/[/\\:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Human-readable download filename for a news PDF, e.g.
// "Easy Spanish News - 2 July 2026.pdf" or, when the article has a custom
// title, "Easy Spanish News - {title}.pdf".
export function newsPdfFilename(news: {
  title: string | null;
  date: string;
}): string {
  const label = news.title?.trim() ? news.title.trim() : formatNewsDate(news.date);
  return `${sanitiseForFilename(`Easy Spanish News - ${label}`)}.pdf`;
}
