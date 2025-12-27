import { z } from "zod";

export const AxisPositionSchema = z
  .number()
  .min(-1, "Axis position must be >= -1")
  .max(1, "Axis position must be <= 1");

export const PartyAxisPositionsSchema = z.record(
  z.string(),
  AxisPositionSchema
);

export const PartyPositionsFileSchema = z
  .object({
    parties: z.record(z.string(), PartyAxisPositionsSchema),
  })
  .superRefine((value, ctx) => {
    const partyEntries = Object.entries(value.parties);
    const firstEntry = partyEntries[0];
    if (!firstEntry) {
      return;
    }

    const [, firstPositions] = firstEntry;
    const baselineAxes = new Set(Object.keys(firstPositions));

    for (const [partyId, positions] of partyEntries) {
      const axes = Object.keys(positions);
      if (axes.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: `Party ${partyId} has no axis positions`,
          path: ["parties", partyId],
        });
        continue;
      }

      for (const axisId of axes) {
        if (!baselineAxes.has(axisId)) {
          ctx.addIssue({
            code: "custom",
            message: `Party ${partyId} has unexpected axis ${axisId}`,
            path: ["parties", partyId, axisId],
          });
        }
      }

      for (const missing of baselineAxes) {
        if (!Object.prototype.hasOwnProperty.call(positions, missing)) {
          ctx.addIssue({
            code: "custom",
            message: `Party ${partyId} is missing axis ${missing}`,
            path: ["parties", partyId],
          });
        }
      }
    }
  });

export type AxisPosition = z.infer<typeof AxisPositionSchema>;
export type PartyAxisPositions = z.infer<typeof PartyAxisPositionsSchema>;
export type PartyPositionsFile = z.infer<typeof PartyPositionsFileSchema>;
