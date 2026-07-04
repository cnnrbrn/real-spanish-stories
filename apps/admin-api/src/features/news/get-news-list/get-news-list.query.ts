import { Query } from "@nestjs/cqrs";
import type { News } from "@real-spanish-stories/shared";

export class GetNewsListQuery extends Query<News[]> {
  constructor() {
    super();
  }
}
