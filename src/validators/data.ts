import { ZodError } from "zod";
import { AxesFileSchema, type AxesFile } from "../schemas/axis";
import { PartiesArraySchema, type Party } from "../schemas/party";
import {
  PartyPositionsFileSchema,
  type PartyPositionsFile,
} from "../schemas/party-positions";
import { QuestionsFileSchema, type QuestionsFile } from "../schemas/question";
import {
  TranslationFileSchema,
  type TranslationFile,
} from "../schemas/translation";

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

export interface ConsistencyValidationResult {
  success: boolean;
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

export function validateDatasetConsistency(params: {
  axes: unknown;
  questions: unknown;
  parties: unknown;
  partyPositions: unknown;
  translationsByLocale: Record<string, unknown>;
}): ConsistencyValidationResult {
  const errors: string[] = [];

  const axesResult = validateAxes(params.axes);
  const questionsResult = validateQuestions(params.questions);
  const partiesResult = validateParties(params.parties);
  const partyPositionsResult = validatePartyPositions(params.partyPositions);

  const translationResults = Object.entries(params.translationsByLocale).map(
    ([locale, value]) => ({
      locale,
      result: validateTranslation(value),
    })
  );

  for (const result of [
    axesResult,
    questionsResult,
    partiesResult,
    partyPositionsResult,
  ]) {
    if (!result.success && result.errors) {
      errors.push(...result.errors);
    }
  }

  for (const { locale, result } of translationResults) {
    if (!result.success && result.errors) {
      errors.push(...result.errors.map((e) => `[${locale}] ${e}`));
    }
  }

  if (
    !axesResult.success ||
    !questionsResult.success ||
    !partiesResult.success ||
    !partyPositionsResult.success ||
    translationResults.some(({ result }) => !result.success)
  ) {
    return { success: false, errors };
  }

  const axes = axesResult.data as AxesFile;
  const questions = questionsResult.data as QuestionsFile;
  const parties = partiesResult.data as Party[];
  const partyPositions = partyPositionsResult.data as PartyPositionsFile;
  const translationsByLocale: Record<string, TranslationFile> = {};
  for (const { locale, result } of translationResults) {
    if (result.data) {
      translationsByLocale[locale] = result.data as TranslationFile;
    }
  }

  const axisIds = new Set(axes.axes.map((axis) => axis.id));
  const partyIds = new Set(parties.map((party) => party.id));
  const questionIds = new Set(
    questions.questions.map((question) => question.id)
  );

  for (const question of questions.questions) {
    if (!axisIds.has(question.axis)) {
      errors.push(
        `Question ${question.id} references missing axis ${question.axis}`
      );
    }
  }

  for (const [partyId, positions] of Object.entries(partyPositions.parties)) {
    if (!partyIds.has(partyId)) {
      errors.push(`Party position specified for unknown party ${partyId}`);
    }

    for (const axisId of Object.keys(positions)) {
      if (!axisIds.has(axisId)) {
        errors.push(`Party ${partyId} has position for unknown axis ${axisId}`);
      }
    }

    for (const axisId of axisIds) {
      if (!Object.prototype.hasOwnProperty.call(positions, axisId)) {
        errors.push(`Party ${partyId} missing position for axis ${axisId}`);
      }
    }
  }

  for (const party of parties) {
    if (
      !Object.prototype.hasOwnProperty.call(partyPositions.parties, party.id)
    ) {
      errors.push(`Party ${party.id} missing party positions entry`);
    }
  }

  const locales = Object.keys(translationsByLocale);

  for (const [locale, translation] of Object.entries(translationsByLocale)) {
    for (const questionId of questionIds) {
      const questionTranslation = translation.questions?.[questionId];
      if (!questionTranslation || !questionTranslation.text) {
        errors.push(
          `Locale ${locale} missing translation for question ${questionId}`
        );
      }
    }

    for (const axisId of axisIds) {
      const axisTranslation = translation.axes?.[axisId];
      if (!axisTranslation || !axisTranslation.short) {
        errors.push(`Locale ${locale} missing translation for axis ${axisId}`);
      }
    }

    for (const partyId of partyIds) {
      const partyTranslation = (translation as TranslationFile).party?.[
        partyId
      ] as { desc?: string; ideology?: string } | undefined;
      if (
        !partyTranslation ||
        !partyTranslation.desc ||
        !partyTranslation.ideology
      ) {
        errors.push(
          `Locale ${locale} missing translation for party ${partyId}`
        );
      }
    }
  }

  if (locales.length > 1) {
    const [firstLocale, ...rest] = locales;
    const baseTranslation = translationsByLocale[firstLocale];
    const baseQuestionKeys = new Set(
      Object.keys(baseTranslation.questions || {})
    );
    const baseAxisKeys = new Set(Object.keys(baseTranslation.axes || {}));
    const basePartyKeys = new Set(Object.keys(baseTranslation.party || {}));

    for (const locale of rest) {
      const translation = translationsByLocale[locale];
      const questionKeys = new Set(Object.keys(translation.questions || {}));
      const axisKeys = new Set(Object.keys(translation.axes || {}));
      const partyKeys = new Set(Object.keys(translation.party || {}));

      for (const key of baseQuestionKeys) {
        if (!questionKeys.has(key)) {
          errors.push(`Locale ${locale} missing question key ${key}`);
        }
      }

      for (const key of baseAxisKeys) {
        if (!axisKeys.has(key)) {
          errors.push(`Locale ${locale} missing axis key ${key}`);
        }
      }

      for (const key of basePartyKeys) {
        if (!partyKeys.has(key)) {
          errors.push(`Locale ${locale} missing party key ${key}`);
        }
      }
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true };
}
