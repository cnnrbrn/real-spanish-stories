import { z } from "zod";

const minMessageLength = 10;

export const contactSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.email("Please enter a valid email"),
  message: z
    .string()
    .min(
      minMessageLength,
      `Please enter a message of at least ${minMessageLength} characters`,
    )
    .max(2000),
  website: z.string().max(0).optional(),
});

export type ContactRequest = z.infer<typeof contactSchema>;
