import { Query } from "@nestjs/cqrs";
import type { Story } from "@real-spanish-stories/shared";

export class GetStoriesQuery extends Query<Story[]> {
  constructor() {
    super();
  }
}
