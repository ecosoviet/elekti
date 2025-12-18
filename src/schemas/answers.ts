import { z } from "zod";

export const AnswerIndexSchema = z
  .number()
  .int("Answer index must be an integer")
  .min(0, "Answer index must be >= 0")
  .max(4, "Answer index must be <= 4");

export const AnswersRecordSchema = z.record(z.string(), AnswerIndexSchema);

export const EncodedAnswersSchema = z
  .string()
  .min(1, "Encoded answers cannot be empty")
  .regex(/^[A-Za-z0-9_-]+$/, "Encoded answers must be valid base64url");

export type AnswerIndex = z.infer<typeof AnswerIndexSchema>;
export type AnswersRecord = z.infer<typeof AnswersRecordSchema>;
export type EncodedAnswers = z.infer<typeof EncodedAnswersSchema>;
