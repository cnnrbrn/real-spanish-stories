import { BadRequestException, Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import type { VideoStatus } from "@real-spanish-stories/shared";
import { DetectSectionsCommand } from "./detect-sections.command";
import type { Video } from "../videos.schema";
import { videosSchema } from "../videos.schema";
import { DATABASE_CONNECTION } from "src/database/database.constants";
import { detectSections } from "./detect-sections.utils";

const ALLOWED_STATUSES: VideoStatus[] = [
  "transcribed",
  "sectioned",
  "language_tagged",
  "completed",
  "failed",
];

@CommandHandler(DetectSectionsCommand)
export class DetectSectionsHandler
  implements ICommandHandler<DetectSectionsCommand>
{
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      videos: typeof videosSchema;
    }>,
  ) {}

  async execute(command: DetectSectionsCommand): Promise<Video> {
    const video = await this.database.query.videos.findFirst({
      where: eq(videosSchema.id, command.videoId),
    });

    if (!video) {
      throw new NotFoundException(
        `Video with id ${command.videoId} not found`,
      );
    }

    if (!video.transcriptionJson) {
      throw new BadRequestException(
        "Video has no transcription. Upload audio first.",
      );
    }

    if (!ALLOWED_STATUSES.includes(video.status)) {
      throw new BadRequestException(
        `Video must be in 'transcribed', 'sectioned', 'language_tagged', 'completed', or 'failed' status, currently: ${video.status}`,
      );
    }

    // Set status to sectioning
    await this.database
      .update(videosSchema)
      .set({ status: "sectioning", updatedAt: new Date() })
      .where(eq(videosSchema.id, command.videoId));

    try {
      const sectionsJson = detectSections(
        video.transcriptionJson,
        video.title,
        video.altTitle,
        video.useSpanishHeadings,
        video.level,
      );

      const [updated] = await this.database
        .update(videosSchema)
        .set({
          sectionsJson: JSON.stringify(sectionsJson),
          status: "sectioned",
          errorMessage: null,
          updatedAt: new Date(),
        })
        .where(eq(videosSchema.id, command.videoId))
        .returning();

      return updated;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";

      const [failed] = await this.database
        .update(videosSchema)
        .set({
          status: "failed",
          errorMessage: `Section detection failed: ${message}`,
          updatedAt: new Date(),
        })
        .where(eq(videosSchema.id, command.videoId))
        .returning();

      return failed;
    }
  }
}
