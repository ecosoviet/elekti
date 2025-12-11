import { z } from "zod";

export const QuestionTranslationSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  axis: z.string().min(1, "Axis name is required"),
});

export const PartyTranslationSchema = z.object({
  desc: z.string().min(1, "Party description is required"),
});

export const TranslationFileSchema = z.object({
  questions: z.record(z.string(), QuestionTranslationSchema),
  party: z.record(z.string(), PartyTranslationSchema),
  axes: z.record(
    z.string(),
    z.object({
      short: z.string().min(1, "Axis short name is required"),
    })
  ),
});

export type QuestionTranslation = z.infer<typeof QuestionTranslationSchema>;
export type PartyTranslation = z.infer<typeof PartyTranslationSchema>;
export type TranslationFile = z.infer<typeof TranslationFileSchema>;
