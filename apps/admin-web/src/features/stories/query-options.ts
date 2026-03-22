import { queryOptions } from "@tanstack/react-query"
import { storyKeys } from "./constants"
import { listStories, getStoryByVideoId } from "./api"

export const listStoriesQueryOptions = () =>
  queryOptions({
    queryKey: storyKeys.list(),
    queryFn: listStories,
  })

export const storyByVideoQueryOptions = (videoId: number) =>
  queryOptions({
    queryKey: storyKeys.byVideo(videoId),
    queryFn: () => getStoryByVideoId(videoId),
  })
