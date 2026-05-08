import { contactSchema } from "@real-spanish-stories/shared";
import { createZodDto } from "nestjs-zod";

export class ContactRequestDto extends createZodDto(contactSchema) {}
