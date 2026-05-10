export class GetStoryPdfQuery {
  constructor(
    public readonly userId: string,
    public readonly id: number,
    public readonly theme: 'light' | 'dark'
  ) {}
}
