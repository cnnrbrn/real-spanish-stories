import { Module } from "@nestjs/common";
import { Resend } from "resend";
import { AppController } from "./app.controller";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { DatabaseModule } from "./database/database.module";
import { StoriesModule } from "./features/stories/stories.module";
import { TranslateModule } from "./features/translate/translate.module";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { ZodSerializerInterceptor, ZodValidationPipe } from "nestjs-zod";
import { AllExceptionsFilter } from "./filters/all-exceptions.filter";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { DATABASE_CONNECTION } from "./database/database.constants";
import { UsersModule } from "./features/users/users.module";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env"],
    }),
    CqrsModule.forRoot(),
    DatabaseModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    AuthModule.forRootAsync({
      imports: [DatabaseModule],
      useFactory: (database: NodePgDatabase, configService: ConfigService) => {
        const resend = new Resend(configService.getOrThrow("RESEND_API_KEY"));
        return {
          bodyParser: {
            json: { limit: "2mb" },
            urlencoded: { limit: "2mb", extended: true },
          },
          auth: betterAuth({
            database: drizzleAdapter(database, {
              provider: "pg",
            }),
            basePath: "/v1/auth",
            emailAndPassword: {
              enabled: true,
              requireEmailVerification: true,
            },
            emailVerification: {
              sendOnSignUp: true,
              autoSignInAfterVerification: true,
              sendVerificationEmail: async ({ user, url }) => {
                const result = await resend.emails.send({
                  from: configService.getOrThrow("RESEND_FROM_EMAIL"),
                  to: user.email,
                  subject: "Verify your email – Real Spanish Stories",
                  html: `<p>Click the link below to verify your email:</p><p><a href="${url}">${url}</a></p>`,
                });
                console.log("[resend]", result);
              },
            },
            trustedOrigins: ["http://localhost:3000"],
          }),
        };
      },
      inject: [DATABASE_CONNECTION, ConfigService],
    }),
    StoriesModule,
    TranslateModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule {}
