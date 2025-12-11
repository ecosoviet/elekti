import { ZodError } from "zod";
import {
  AnswerIndexSchema,
  AnswersRecordSchema,
  EncodedAnswersSchema,
} from "../schemas/answers";

export interface AnswerValidationResult {
  success: boolean;
  value?: number;
  error?: string;
}

export interface DecodedAnswersResult {
  success: boolean;
  answers?: Record<string, number>;
  error?: string;
}

export function validateAnswerIndex(value: unknown): AnswerValidationResult {
  try {
    const validated = AnswerIndexSchema.parse(value);
    return { success: true, value: validated };
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      const zodError = error as ZodError;
      return { success: false, error: zodError.issues[0]?.message };
    }
    return { success: false, error: "Unknown validation error" };
  }
}

export function validateAnswersRecord(data: unknown): {
  success: boolean;
  answers?: Record<string, number>;
  error?: string;
} {
  try {
    const validated = AnswersRecordSchema.parse(data);
    return { success: true, answers: validated };
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      const zodError = error as ZodError;
      return { success: false, error: zodError.issues[0]?.message };
    }
    return { success: false, error: "Unknown validation error" };
  }
}

export function validateEncodedAnswers(encoded: unknown): {
  success: boolean;
  value?: string;
  error?: string;
} {
  try {
    const validated = EncodedAnswersSchema.parse(encoded);
    return { success: true, value: validated };
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      const zodError = error as ZodError;
      return { success: false, error: zodError.issues[0]?.message };
    }
    return { success: false, error: "Unknown validation error" };
  }
}

export function decodeAndValidateAnswers(
  encoded: string,
  questionIds: string[]
): DecodedAnswersResult {
  const encodedValidation = validateEncodedAnswers(encoded);
  if (!encodedValidation.success) {
    return { success: false, error: encodedValidation.error };
  }

  try {
    const decoded = atob(encoded);
    const parts = decoded.split(",");
    const newAnswers: Record<string, number> = {};
    let hasValidAnswers = false;

    for (const [index, questionId] of questionIds.entries()) {
      const value = parts[index];
      if (value && value !== "") {
        const numberValue = Number.parseInt(value, 10);
        const validation = validateAnswerIndex(numberValue);

        if (validation.success && validation.value !== undefined) {
          newAnswers[questionId] = validation.value;
          hasValidAnswers = true;
        }
      }
    }

    if (!hasValidAnswers) {
      return {
        success: false,
        error: "No valid answers found in encoded data",
      };
    }

    return { success: true, answers: newAnswers };
  } catch {
    return { success: false, error: "Failed to decode base64 string" };
  }
}
