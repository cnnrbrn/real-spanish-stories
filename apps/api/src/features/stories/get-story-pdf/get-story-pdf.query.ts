export class GetStoryPdfQuery {
  constructor(
    public readonly id: number,
    public readonly theme: 'light' | 'dark'
  ) {}
}
