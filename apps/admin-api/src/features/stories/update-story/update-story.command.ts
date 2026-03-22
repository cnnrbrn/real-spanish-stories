import type { UpdateStoryDto } from "../stories.dto";

export class UpdateStoryCommand {
  constructor(
    public readonly id: number,
    public readonly data: UpdateStoryDto,
  ) {}
}
