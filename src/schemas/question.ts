import { z } from "zod";

export const QuestionDirectionSchema = z
  .enum(["positive", "negative"])
  .optional();

export const QuestionMetadataSchema = z.object({
  id: z.string().regex(/^q\d+$/, "Question ID must be in format q1, q2, etc."),
  textKey: z
    .string()
    .regex(
      /^questions\.q\d+\.text$/,
      "Text key must be in format questions.qN.text"
    ),
  axis: z.string().min(1, "Axis must be specified"),
  weight: z.number().positive("Weight must be positive"),
  direction: QuestionDirectionSchema,
});

export const QuestionsFileSchema = z.object({
  questions: z
    .array(QuestionMetadataSchema)
    .min(1, "Must have at least one question")
    .superRefine((value, ctx) => {
      const seenIds = new Set<string>();
      const seenTextKeys = new Set<string>();

      for (const question of value) {
        if (seenIds.has(question.id)) {
          ctx.addIssue({
            code: "custom",
            message: `Duplicate question id: ${question.id}`,
            path: ["questions"],
          });
        } else {
          seenIds.add(question.id);
        }

        if (seenTextKeys.has(question.textKey)) {
          ctx.addIssue({
            code: "custom",
            message: `Duplicate question textKey: ${question.textKey}`,
            path: ["questions"],
          });
        } else {
          seenTextKeys.add(question.textKey);
        }
      }
    }),
});

export type QuestionMetadata = z.infer<typeof QuestionMetadataSchema>;
export type QuestionsFile = z.infer<typeof QuestionsFileSchema>;
