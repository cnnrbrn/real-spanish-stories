import { Module } from "@nestjs/common";
import { DATABASE_CONNECTION } from "./database.constants";
import { ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { videosSchema } from "@real-spanish-stories/shared";
import { storiesSchema } from "@real-spanish-stories/shared";
import { newsSchema } from "@real-spanish-stories/shared";

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const pool = new Pool({
          connectionString: configService.getOrThrow("DATABASE_URL"),
        });
        return drizzle(pool, {
          schema: { videos: videosSchema, stories: storiesSchema, news: newsSchema },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
