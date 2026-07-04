import type { UpdateNewsDto } from "../news.dto";

export class UpdateNewsCommand {
  constructor(
    public readonly id: number,
    public readonly data: UpdateNewsDto,
  ) {}
}
