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

// Fast machine-translation gloss request. Context-free by design (no story or
// news id), which is what makes the gloss cache global by phrase.
export const glossRequestSchema = z.object({
  phrase: z.string(),
});

export type GlossRequest = z.infer<typeof glossRequestSchema>;

export const glossResponseSchema = z.object({
  gloss: z.string(),
});

export type GlossResponse = z.infer<typeof glossResponseSchema>;
