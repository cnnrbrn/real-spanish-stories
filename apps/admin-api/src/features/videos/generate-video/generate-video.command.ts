import { Command } from "@nestjs/cqrs";
import type { Video } from "../videos.schema";

export class GenerateVideoCommand extends Command<Video> {
  constructor(
    public readonly videoId: number,
    public readonly draftMode: boolean,
  ) {
    super();
  }
}
