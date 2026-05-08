import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { Throttle } from "@nestjs/throttler";
import { ContactRequestDto } from "./contact.dto";
import { SubmitContactCommand } from "./submit-contact/submit-contact.command";

@ApiTags("contact")
@Controller("contact")
export class ContactController {
  constructor(private readonly commandBus: CommandBus) {}

  @AllowAnonymous()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Submit a contact form message" })
  submit(@Body() body: ContactRequestDto) {
    return this.commandBus.execute(
      new SubmitContactCommand(body.name, body.email, body.message, body.website),
    );
  }
}
