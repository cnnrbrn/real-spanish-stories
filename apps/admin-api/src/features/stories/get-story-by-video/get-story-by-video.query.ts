import { Query } from "@nestjs/cqrs";
import type { Story } from "@real-spanish-stories/shared";

export class GetStoryByVideoQuery extends Query<Story> {
  constructor(public readonly videoId: number) {
    super();
  }
}
