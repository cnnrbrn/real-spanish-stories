import { queryOptions } from "@tanstack/react-query"
import { newsKeys } from "./constants"
import { listNews } from "./api"

export const listNewsQueryOptions = () =>
  queryOptions({
    queryKey: newsKeys.list(),
    queryFn: listNews,
  })
