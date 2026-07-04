import type { UpdateNewsStatusDto } from "../news.dto";

export class UpdateNewsStatusCommand {
  constructor(
    public readonly id: number,
    public readonly data: UpdateNewsStatusDto,
  ) {}
}
