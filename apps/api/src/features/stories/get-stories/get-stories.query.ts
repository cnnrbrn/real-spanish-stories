import { Query } from "@nestjs/cqrs";
import type { StoryLevel, StoryResponse } from "@real-spanish-stories/shared";

export class GetStoriesQuery extends Query<StoryResponse[]> {
  constructor(public readonly levels?: StoryLevel[]) {
    super();
  }
}
