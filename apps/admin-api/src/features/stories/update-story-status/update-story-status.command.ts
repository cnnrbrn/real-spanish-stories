import type { UpdateStoryStatusDto } from "../stories.dto";

export class UpdateStoryStatusCommand {
  constructor(
    public readonly id: number,
    public readonly data: UpdateStoryStatusDto,
  ) {}
}
