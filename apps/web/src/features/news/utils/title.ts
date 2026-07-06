import { formatNewsDate } from './date'

const NEWS_SERIES_NAME = 'Latin American News in Slow, Easy Spanish'

// Heading for a news item. Items rarely have a custom title, so the default
// is a keyword-rich, unique heading (series name + date) rather than a bare date.
export function newsHeading(news: {
  title: string | null
  date: string
}): string {
  return news.title ?? `${NEWS_SERIES_NAME} - ${formatNewsDate(news.date)}`
}
