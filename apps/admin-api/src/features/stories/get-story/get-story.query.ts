import { Query } from "@nestjs/cqrs";
import type { Story } from "@real-spanish-stories/shared";

export class GetStoryQuery extends Query<Story> {
  constructor(public readonly id: number) {
    super();
  }
}
