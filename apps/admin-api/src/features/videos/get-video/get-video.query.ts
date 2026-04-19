import { Query } from "@nestjs/cqrs";
import type { Video } from "@real-spanish-stories/shared";

export class GetVideoQuery extends Query<Video> {
  constructor(public readonly id: number) {
    super();
  }
}
