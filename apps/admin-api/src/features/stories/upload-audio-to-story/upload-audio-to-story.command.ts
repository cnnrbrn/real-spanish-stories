import { ICommand } from "@nestjs/cqrs";

export class UploadAudioToStoryCommand implements ICommand {
  constructor(
    public readonly storyId: number,
    public readonly file: any,
  ) {}
}
