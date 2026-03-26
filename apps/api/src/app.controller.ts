import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

@Controller()
export class AppController {
  @AllowAnonymous()
  @SkipThrottle()
  @Get()
  healthCheck() {
    return { status: "ok" };
  }
}
