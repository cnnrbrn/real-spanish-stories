export class SubmitContactCommand {
  constructor(
    public readonly name: string | undefined,
    public readonly email: string,
    public readonly message: string,
    public readonly website: string | undefined,
  ) {}
}
