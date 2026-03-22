import { Query } from "@nestjs/cqrs";
import type { Video } from "../videos.schema";

export class GetVideoQuery extends Query<Video> {
  constructor(public readonly id: number) {
    super();
  }
}
