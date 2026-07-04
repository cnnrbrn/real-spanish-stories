import { Query } from "@nestjs/cqrs";
import type { NewsDetail } from "@real-spanish-stories/shared";

export class GetNewsByDateQuery extends Query<NewsDetail> {
  constructor(public readonly date: string) {
    super();
  }
}
