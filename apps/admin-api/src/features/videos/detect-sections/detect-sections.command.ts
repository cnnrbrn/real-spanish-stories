import { Command } from "@nestjs/cqrs";
import type { Video } from "../videos.schema";

export class DetectSectionsCommand extends Command<Video> {
  constructor(public readonly videoId: number) {
    super();
  }
}
