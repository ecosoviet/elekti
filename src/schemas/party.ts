import { z } from "zod";

export const PartySchema = z.object({
  id: z.string().min(1, "Party ID is required"),
  short: z.string().min(1, "Short name is required"),
  name: z.string().min(1, "Party name is required"),
  descriptionKey: z.string().min(1, "Description key is required"),
  colour: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Colour must be a valid hex colour code"),
  website: z.string().url("Website must be a valid URL"),
  logo: z.string().optional(),
});

export const PartiesArraySchema = z
  .array(PartySchema)
  .min(1, "Must have at least one party");

export type Party = z.infer<typeof PartySchema>;
export type PartiesArray = z.infer<typeof PartiesArraySchema>;
