import { Command } from "@nestjs/cqrs";
import type { Video } from "../videos.schema";

export class ImportSubtitleCommand extends Command<Video> {
  constructor(
    public readonly videoId: number,
    public readonly assContent: string,
  ) {
    super();
  }
}
