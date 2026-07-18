import type { ContentType } from "@real-spanish-stories/shared";

export class CreateVideoCommand {
  constructor(
    public readonly title: string,
    public readonly altTitle: string,
    public readonly level: string | null,
    public readonly contentType: ContentType,
  ) {}
}
