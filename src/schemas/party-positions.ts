import { z } from "zod";

export const AxisPositionSchema = z
  .number()
  .min(-1, "Axis position must be >= -1")
  .max(1, "Axis position must be <= 1");

export const PartyAxisPositionsSchema = z.record(
  z.string(),
  AxisPositionSchema
);

export const PartyPositionsFileSchema = z.object({
  parties: z.record(z.string(), PartyAxisPositionsSchema),
});

export type AxisPosition = z.infer<typeof AxisPositionSchema>;
export type PartyAxisPositions = z.infer<typeof PartyAxisPositionsSchema>;
export type PartyPositionsFile = z.infer<typeof PartyPositionsFileSchema>;
