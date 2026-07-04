import { NewsItem } from './news-item'
import type { NewsDetail } from '@real-spanish-stories/shared'

interface NewsListProps {
  news: Array<NewsDetail>
}

export function NewsList({ news }: NewsListProps) {
  if (news.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No news items found. Create one to get started.
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {news.map((item) => (
        <NewsItem key={item.id} news={item} />
      ))}
    </div>
  )
}
