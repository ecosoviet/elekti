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

const BITS_PER_ANSWER = 3;
export const UNANSWERED_VALUE = 7;

function base64UrlEncode(bytes: Uint8Array): string {
  const binary = Array.from(bytes)
    .map((byte) => String.fromCharCode(byte))
    .join("");
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(encoded: string): Uint8Array {
  const padded = encoded + "===".slice((encoded.length + 3) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function packAnswerValues(values: number[]): Uint8Array {
  let buffer = 0;
  let bitsInBuffer = 0;
  const output: number[] = [];

  for (const value of values) {
    buffer = (buffer << BITS_PER_ANSWER) | (value & UNANSWERED_VALUE);
    bitsInBuffer += BITS_PER_ANSWER;

    while (bitsInBuffer >= 8) {
      bitsInBuffer -= 8;
      const byte = (buffer >> bitsInBuffer) & 0xff;
      output.push(byte);
      buffer &= (1 << bitsInBuffer) - 1;
    }
  }

  if (bitsInBuffer > 0) {
    output.push((buffer << (8 - bitsInBuffer)) & 0xff);
  }

  return new Uint8Array(output);
}

function unpackAnswerValues(
  bytes: Uint8Array,
  expectedCount: number
): number[] {
  let buffer = 0;
  let bitsInBuffer = 0;
  const values: number[] = [];

  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bitsInBuffer += 8;

    while (bitsInBuffer >= BITS_PER_ANSWER && values.length < expectedCount) {
      bitsInBuffer -= BITS_PER_ANSWER;
      const value = (buffer >> bitsInBuffer) & UNANSWERED_VALUE;
      values.push(value);
      buffer &= (1 << bitsInBuffer) - 1;
    }
  }

  if (values.length < expectedCount) {
    throw new Error("Not enough data to decode answers");
  }

  return values.slice(0, expectedCount);
}

export function encodeAnswerValuesToBase64Url(values: number[]): string {
  return base64UrlEncode(packAnswerValues(values));
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
    const bytes = base64UrlDecode(encoded);
    const values = unpackAnswerValues(bytes, questionIds.length);
    const newAnswers: Record<string, number> = {};
    let hasValidAnswers = false;

    for (const [index, questionId] of questionIds.entries()) {
      const value = values[index];

      if (value !== undefined && value !== UNANSWERED_VALUE) {
        const validation = validateAnswerIndex(value);

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
