export class RequestAudioDownloadCommand {
  constructor(
    public readonly userId: string,
    public readonly storyId: number,
  ) {}
}
