export class CreateVideoCommand {
  constructor(
    public readonly title: string,
    public readonly altTitle: string,
    public readonly level: string,
  ) {}
}
