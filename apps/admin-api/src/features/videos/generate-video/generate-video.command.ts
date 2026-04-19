import { Command } from "@nestjs/cqrs";
import type { Video } from "@real-spanish-stories/shared";

export class GenerateVideoCommand extends Command<Video> {
  constructor(
    public readonly videoId: number,
    public readonly draftMode: boolean,
  ) {
    super();
  }
}
