import { z } from "zod";

export const chargeSchema = z.object({
  name: z.string().min(1, "Charge name is required."),
  kind: z.enum(["GST", "ADDITIONAL"]),
  rate: z.coerce.number().nonnegative().optional().nullable(),
  amount: z.coerce.number().nonnegative().optional().nullable(),
  taxable: z.boolean().default(true)
});

export const calculationItemSchema = z
  .object({
    metalId: z.string().uuid().optional().nullable(),
    rawMaterialId: z.string().uuid().optional().nullable(),
    gradeId: z.string().uuid().optional().nullable(),
    quantity: z.coerce.number().positive("Quantity must be positive."),
    compositionPct: z.coerce.number().positive().max(100).optional().nullable()
  })
  .refine(
    (d) => Boolean(d.metalId) !== Boolean(d.rawMaterialId),
    "Choose exactly one metal or raw material per item."
  );

export const createCalculationSchema = z.object({
  name: z.string().min(2).default("Cost Calculation"),
  mode: z.enum(["metal", "alloy", "raw-material"]),
  alloyId: z.string().uuid().optional().nullable(),
  items: z.array(calculationItemSchema).min(1, "At least one item is required."),
  charges: z.array(chargeSchema).optional()
});

export const calculationQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(10),
  status: z.string().optional(),
  search: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  mode: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).default("desc")
});

export type CreateCalculationInput = z.infer<typeof createCalculationSchema>;
export type ChargeInput = z.infer<typeof chargeSchema>;
export type CalculationItemInput = z.infer<typeof calculationItemSchema>;
export type CalculationQueryInput = z.infer<typeof calculationQuerySchema>;
