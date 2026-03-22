import { Controller, Get } from "@nestjs/common";
import { OptionalAuth, Session, UserSession } from "@thallesp/nestjs-better-auth";

@Controller("users")
export class UsersController {
  @Get("session")
  @OptionalAuth()
  getSession(@Session() session: UserSession | null) {
    return session;
  }
}
