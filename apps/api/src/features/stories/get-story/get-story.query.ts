import { Query } from "@nestjs/cqrs";
import type { StoryDetail } from "@real-spanish-stories/shared";

export class GetStoryQuery extends Query<StoryDetail> {
  constructor(public readonly id: number) {
    super();
  }
}
