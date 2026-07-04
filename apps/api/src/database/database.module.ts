import { Module } from "@nestjs/common";
import { DATABASE_CONNECTION } from "./database.constants";
import { ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { storiesSchema, storyDownloadsSchema, user, session, account, verification, newsSchema } from "@real-spanish-stories/shared";

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const pool = new Pool({
          connectionString: configService.getOrThrow("DATABASE_URL"),
        });
        return drizzle(pool, {
          schema: {
            stories: storiesSchema,
            storyDownloads: storyDownloadsSchema,
            news: newsSchema,
            user,
            session,
            account,
            verification,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
