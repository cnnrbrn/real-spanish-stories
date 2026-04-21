import { Query } from "@nestjs/cqrs";
import type { StoryGroup } from "@real-spanish-stories/shared";

export class GetStoriesGroupedQuery extends Query<StoryGroup[]> {}
