import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { Resend } from "resend";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DatabaseModule } from "../database/database.module";
import { DATABASE_CONNECTION } from "../database/database.constants";

@Module({
  imports: [
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
            database: drizzleAdapter(database, { provider: "pg" }),
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
                  subject: "Real Spanish Stories Verfication",
                  html: `<p>Click the link below to verify your email:</p><p><a href="${url}">${url}</a></p>`,
                });
                console.log("[resend]", result);
              },
            },
            trustedOrigins: [
              "http://localhost:3000",
              "https://realspanishstories.com",
            ],
          }),
        };
      },
      inject: [DATABASE_CONNECTION, ConfigService],
    }),
  ],
})
export class BetterAuthModule {}
