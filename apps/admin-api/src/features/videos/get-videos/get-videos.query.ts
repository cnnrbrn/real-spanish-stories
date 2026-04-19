import { Query } from "@nestjs/cqrs";
import type { Video } from "@real-spanish-stories/shared";

export class GetVideosQuery extends Query<Video[]> {
  constructor() {
    super();
  }
}
