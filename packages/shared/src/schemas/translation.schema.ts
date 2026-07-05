import { z } from "zod";

export const translationRequestSchema = z
  .object({
    phrase: z.string(),
    storyId: z.number().optional(),
    newsId: z.number().optional(),
  })
  .refine((v) => (v.storyId == null) !== (v.newsId == null), {
    message: "Provide exactly one of storyId or newsId",
  });

export type TranslationRequest = z.infer<typeof translationRequestSchema>;

export const translationResponseSchema = z.object({
  translation: z.string(),
  explanation: z.array(z.string()),
});

export type TranslationResponse = z.infer<typeof translationResponseSchema>;
