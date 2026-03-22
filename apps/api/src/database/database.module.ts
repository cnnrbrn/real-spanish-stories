import { Module } from "@nestjs/common";
import { DATABASE_CONNECTION } from "./database.constants";
import { ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { storiesSchema } from "@real-spanish-stories/shared";
import * as authSchema from "src/auth/auth.schema";

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
            ...authSchema,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
