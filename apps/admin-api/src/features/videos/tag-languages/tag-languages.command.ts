import { Command } from "@nestjs/cqrs";
import type { Video } from "@real-spanish-stories/shared";

export class TagLanguagesCommand extends Command<Video> {
  constructor(public readonly videoId: number) {
    super();
  }
}
