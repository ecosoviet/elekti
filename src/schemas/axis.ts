import { z } from "zod";

export const AxisSchema = z.object({
  id: z.string().min(1, "Axis ID is required"),
  name: z.string().min(1, "Axis name is required"),
  shortNameKey: z.string().min(1, "Short name key is required"),
  description: z.string().min(1, "Description is required"),
});

export const AxesFileSchema = z.object({
  axes: z.array(AxisSchema).min(1, "Must have at least one axis"),
});

export type Axis = z.infer<typeof AxisSchema>;
export type AxesFile = z.infer<typeof AxesFileSchema>;
