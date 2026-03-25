import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";

@Module({
  imports: [BullModule.registerQueue({ name: "video-generation" })],
  exports: [BullModule],
})
export class VideoGenerationModule {}
