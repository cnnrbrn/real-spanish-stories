export class TranslatePhraseCommand {
  constructor(
    public readonly phrase: string,
    public readonly storyId?: number,
    public readonly newsId?: number,
  ) {}
}
