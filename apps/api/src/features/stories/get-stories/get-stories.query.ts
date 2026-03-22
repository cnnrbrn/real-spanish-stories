import { Query } from "@nestjs/cqrs";
import type { StoryResponse } from "@real-spanish-stories/shared";

export class GetStoriesQuery extends Query<StoryResponse[]> {
  constructor() {
    super();
  }
}
