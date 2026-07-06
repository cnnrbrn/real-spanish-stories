export class GetNewsPdfQuery {
  constructor(
    public readonly userId: string,
    public readonly id: number,
  ) {}
}
