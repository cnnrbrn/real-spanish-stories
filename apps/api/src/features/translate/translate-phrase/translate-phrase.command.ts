export class TranslatePhraseCommand {
  constructor(
    public readonly phrase: string,
    public readonly storyId: number,
  ) {}
}
