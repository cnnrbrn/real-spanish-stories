import type { CreateNewsDto } from "../news.dto";

export class CreateNewsCommand {
  constructor(public readonly data: CreateNewsDto) {}
}
