import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { Resend } from "resend";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DatabaseModule } from "../database/database.module";
import { DATABASE_CONNECTION } from "../database/database.constants";
import { emailTemplate } from "./email-template";

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
            basePath: "/api/v1/auth",
            emailAndPassword: {
              enabled: true,
              requireEmailVerification: true,
              sendResetPassword: async ({ user, url }) => {
                await resend.emails.send({
                  from: configService.getOrThrow("RESEND_FROM_EMAIL"),
                  to: user.email,
                  subject: "Reset your Real Spanish Stories password",
                  html: emailTemplate({
                    heading: "Reset your password",
                    body: "Click the button below to choose a new password for your <strong>Real Spanish Stories</strong> account. The link expires in an hour.",
                    ctaUrl: url,
                    ctaText: "Reset password",
                  }),
                });
              },
            },
            emailVerification: {
              sendOnSignUp: true,
              autoSignInAfterVerification: true,
              sendVerificationEmail: async ({ user, url }) => {
                await resend.emails.send({
                  from: configService.getOrThrow("RESEND_FROM_EMAIL"),
                  to: user.email,
                  subject: "Verify your Real Spanish Stories account",
                  html: emailTemplate({
                    heading: "Verify your email",
                    body: "Click the button below to verify your email and start using <strong>Real Spanish Stories</strong>.",
                    ctaUrl: url,
                    ctaText: "Verify email",
                  }),
                });
              },
            },
            socialProviders: {
              google: {
                clientId: configService.getOrThrow("GOOGLE_CLIENT_ID"),
                clientSecret: configService.getOrThrow("GOOGLE_CLIENT_SECRET"),
              },
            },
            account: {
              accountLinking: {
                enabled: true,
                trustedProviders: ["google"],
              },
            },
            rateLimit: {
              window: 60,
              max: 100,
              customRules: {
                "/sign-up/email": { window: 3600, max: 5 },
                "/forget-password": { window: 3600, max: 5 },
                "/send-verification-email": { window: 3600, max: 5 },
                "/reset-password": { window: 3600, max: 10 },
                "/sign-in/email": { window: 60, max: 10 },
              },
              storage: "memory",
            },
            trustedOrigins: [configService.getOrThrow("CORS_ORIGIN")],
          }),
        };
      },
      inject: [DATABASE_CONNECTION, ConfigService],
    }),
  ],
})
export class BetterAuthModule {}
