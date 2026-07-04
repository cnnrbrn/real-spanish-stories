import { Query } from "@nestjs/cqrs";
import type { News } from "@real-spanish-stories/shared";

export class GetNewsQuery extends Query<News> {
  constructor(public readonly id: number) {
    super();
  }
}
