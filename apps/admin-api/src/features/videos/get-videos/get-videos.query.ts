import { Query } from "@nestjs/cqrs";
import type { Video } from "../videos.schema";

export class GetVideosQuery extends Query<Video[]> {
  constructor() {
    super();
  }
}
