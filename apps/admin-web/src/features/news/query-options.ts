import { queryOptions } from "@tanstack/react-query"
import { newsKeys } from "./constants"
import { listNews, getNews } from "./api"

export const listNewsQueryOptions = () =>
  queryOptions({
    queryKey: newsKeys.list(),
    queryFn: listNews,
  })

export const newsDetailQueryOptions = (id: number) =>
  queryOptions({
    queryKey: newsKeys.detail(id),
    queryFn: () => getNews(id),
  })
