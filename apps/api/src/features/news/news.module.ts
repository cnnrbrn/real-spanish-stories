import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { DatabaseModule } from "src/database/database.module";
import { StorageModule } from "src/storage/storage.module";
import { NewsController } from "./news.controller";
import { GetNewsHandler } from "./get-news/get-news.handler";
import { GetNewsByDateHandler } from "./get-news-by-date/get-news-by-date.handler";
import { GetNewsPdfHandler } from "./get-news-pdf/get-news-pdf.handler";
import { NewsDownloadRateLimitService } from "./news-download-rate-limit.service";

@Module({
  imports: [DatabaseModule, CqrsModule, StorageModule],
  controllers: [NewsController],
  providers: [
    GetNewsHandler,
    GetNewsByDateHandler,
    GetNewsPdfHandler,
    NewsDownloadRateLimitService,
  ],
})
export class NewsModule {}
