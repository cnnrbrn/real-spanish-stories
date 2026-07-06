import { queryOptions } from "@tanstack/react-query"
import { storyKeys } from "./constants"
import { listStories, getStory, getStoryByVideoId } from "./api"

export const listStoriesQueryOptions = () =>
  queryOptions({
    queryKey: storyKeys.list(),
    queryFn: listStories,
  })

export const storyByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: storyKeys.detail(id),
    queryFn: () => getStory(id),
  })

export const storyByVideoQueryOptions = (videoId: number) =>
  queryOptions({
    queryKey: storyKeys.byVideo(videoId),
    queryFn: () => getStoryByVideoId(videoId),
  })
