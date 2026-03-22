import type { UpdateVideoDto } from "../videos.dto";

export class UpdateVideoCommand {
  constructor(
    public readonly id: number,
    public readonly data: UpdateVideoDto,
  ) {}
}
