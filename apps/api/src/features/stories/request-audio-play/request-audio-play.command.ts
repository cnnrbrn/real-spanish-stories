export class RequestAudioPlayCommand {
  constructor(
    public readonly userId: string,
    public readonly storyId: number,
  ) {}
}
