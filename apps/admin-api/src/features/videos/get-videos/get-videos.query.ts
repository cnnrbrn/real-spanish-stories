import { Query } from "@nestjs/cqrs";
import type { ContentType, VIDEO_STATUS_VALUES } from "@real-spanish-stories/shared";

export interface VideoListItem {
  id: number;
  title: string;
  altTitle: string;
  status: (typeof VIDEO_STATUS_VALUES)[number];
  contentType: ContentType;
  level: string | null;
  useSpanishHeadings: boolean;
  skipEnglishTitle: boolean;
  audioPath: string | null;
  audioFilename: string | null;
  videoPath: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  hasTranscriptionJson: boolean;
  hasSectionsJson: boolean;
  hasLanguageTaggedJson: boolean;
  hasTranscriptionMarkdown: boolean;
}

export class GetVideosQuery extends Query<VideoListItem[]> {
  constructor() {
    super();
  }
}
