import { ZodError } from "zod";
import { AxesFileSchema } from "../schemas/axis";
import { PartiesArraySchema } from "../schemas/party";
import { PartyPositionsFileSchema } from "../schemas/party-positions";
import { QuestionsFileSchema } from "../schemas/question";
import { TranslationFileSchema } from "../schemas/translation";

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

export function validateQuestions(data: unknown): ValidationResult<unknown> {
  try {
    const validated = QuestionsFileSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      const zodError = error as ZodError;
      return {
        success: false,
        errors: zodError.issues.map((e) => `${e.path.join(".")}: ${e.message}`),
      };
    }
    return { success: false, errors: ["Unknown validation error"] };
  }
}

export function validateParties(data: unknown): ValidationResult<unknown> {
  try {
    const validated = PartiesArraySchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      const zodError = error as ZodError;
      return {
        success: false,
        errors: zodError.issues.map((e) => `${e.path.join(".")}: ${e.message}`),
      };
    }
    return { success: false, errors: ["Unknown validation error"] };
  }
}

export function validateAxes(data: unknown): ValidationResult<unknown> {
  try {
    const validated = AxesFileSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      const zodError = error as ZodError;
      return {
        success: false,
        errors: zodError.issues.map((e) => `${e.path.join(".")}: ${e.message}`),
      };
    }
    return { success: false, errors: ["Unknown validation error"] };
  }
}

export function validatePartyPositions(
  data: unknown
): ValidationResult<unknown> {
  try {
    const validated = PartyPositionsFileSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      const zodError = error as ZodError;
      return {
        success: false,
        errors: zodError.issues.map((e) => `${e.path.join(".")}: ${e.message}`),
      };
    }
    return { success: false, errors: ["Unknown validation error"] };
  }
}

export function validateTranslation(data: unknown): ValidationResult<unknown> {
  try {
    const validated = TranslationFileSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      const zodError = error as ZodError;
      return {
        success: false,
        errors: zodError.issues.map((e) => `${e.path.join(".")}: ${e.message}`),
      };
    }
    return { success: false, errors: ["Unknown validation error"] };
  }
}
