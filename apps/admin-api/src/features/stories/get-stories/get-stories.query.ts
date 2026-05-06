import { Query } from "@nestjs/cqrs";

export interface StoryListItem {
  id: number;
  videoId: number | null;
  title: string;
  altTitle: string;
  description: string | null;
  summary: string | null;
  level: string | null;
  status: string;
  audioPath: string | null;
  audioFilename: string | null;
  pdfLightPath: string | null;
  pdfDarkPath: string | null;
  slug: string | null;
  videoLink: string | null;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class GetStoriesQuery extends Query<StoryListItem[]> {
  constructor() {
    super();
  }
}
