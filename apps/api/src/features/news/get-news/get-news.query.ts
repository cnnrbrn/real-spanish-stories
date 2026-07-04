import { Query } from "@nestjs/cqrs";
import type { NewsResponse } from "@real-spanish-stories/shared";

export class GetNewsQuery extends Query<NewsResponse[]> {
  constructor() {
    super();
  }
}
