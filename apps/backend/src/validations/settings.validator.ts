import { z } from "zod";

export const updateSettingSchema = z.object({
  value: z.string().min(1, "Setting value cannot be empty."),
  label: z.string().optional(),
  description: z.string().optional()
});

export const bulkUpdateSettingsSchema = z.record(z.string());

export const createGstSlabSchema = z.object({
  name: z.string().min(2, "GST slab name must be at least 2 characters."),
  code: z.string().min(2, "GST slab code must be at least 2 characters."),
  rate: z.coerce.number().nonnegative().max(100, "Rate cannot exceed 100%."),
  description: z.string().optional(),
  active: z.boolean().default(true)
});

export const updateGstSlabSchema = createGstSlabSchema.partial();

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
export type BulkUpdateSettingsInput = z.infer<typeof bulkUpdateSettingsSchema>;
export type CreateGstSlabInput = z.infer<typeof createGstSlabSchema>;
export type UpdateGstSlabInput = z.infer<typeof updateGstSlabSchema>;
