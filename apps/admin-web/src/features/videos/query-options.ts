import { queryOptions } from "@tanstack/react-query"
import { videoKeys } from "./constants"
import { getVideo, listVideos } from "./api"

export const listVideosQueryOptions = () =>
  queryOptions({
    queryKey: videoKeys.list(),
    queryFn: listVideos,
  })

export const videoQueryOptions = (id: number) =>
  queryOptions({
    queryKey: videoKeys.detail(id),
    queryFn: () => getVideo(id),
  })
