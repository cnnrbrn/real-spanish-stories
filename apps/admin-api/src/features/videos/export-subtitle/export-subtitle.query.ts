import { Query } from "@nestjs/cqrs";

export interface ExportSubtitleResult {
  filename: string;
  content: string;
}

export class ExportSubtitleQuery extends Query<ExportSubtitleResult> {
  constructor(public readonly videoId: number) {
    super();
  }
}
