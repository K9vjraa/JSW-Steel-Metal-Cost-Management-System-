import { z } from "zod";

const statusSchema = z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE");

export const createMetalSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  code: z.string().min(2, "Code must be at least 2 characters."),
  category: z.string().min(2, "Category must be at least 2 characters."),
  unit: z.string().default("kg"),
  status: statusSchema,
  description: z.string().optional()
});

export const updateMetalSchema = createMetalSchema.partial();

export const createRawMaterialSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  unit: z.string().default("kg"),
  status: statusSchema,
  description: z.string().optional()
});

export const updateRawMaterialSchema = createRawMaterialSchema.partial();

export const createSupplierSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  contactName: z.string().optional(),
  email: z.string().email("Must be a valid supplier email."),
  phone: z.string().optional(),
  status: statusSchema
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const priceBaseSchema = z.object({
  metalId: z.string().uuid().optional().nullable(),
  rawMaterialId: z.string().uuid().optional().nullable(),
  supplierId: z.string().uuid().optional().nullable(),
  pricePerUnit: z.coerce.number().nonnegative(),
  currency: z.string().default("INR"),
  unit: z.string().default("kg"),
  source: z.string().min(2),
  location: z.string().default("India"),
  effectiveFrom: z.coerce.date(),
  active: z.boolean().default(true),
  reason: z.string().optional()
});

export const createPriceSchema = priceBaseSchema.refine(
  (d) => Boolean(d.metalId) !== Boolean(d.rawMaterialId),
  "Choose exactly one priced metal or raw material."
);

export const alloyComponentSchema = z.object({
  metalId: z.string().uuid().optional().nullable(),
  gradeId: z.string().uuid().optional().nullable(),
  rawMaterialId: z.string().uuid().optional().nullable(),
  compositionPercent: z.coerce.number().positive().max(100),
  quantity: z.coerce.number().positive().optional().nullable()
});

export const createAlloySchema = z
  .object({
    name: z.string().min(2),
    code: z.string().min(2),
    type: z.string().min(2),
    status: statusSchema,
    components: z.array(alloyComponentSchema).min(1)
  })
  .superRefine((d, ctx) => {
    const total = d.components.reduce((s, c) => s + c.compositionPercent, 0);
    if (total > 100.0001)
      ctx.addIssue({ code: "custom", message: "Alloy composition cannot exceed 100%." });
  });

export const updateAlloySchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  type: z.string().min(2).optional(),
  status: statusSchema.optional(),
  components: z.array(alloyComponentSchema).optional()
});

export const metalQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).default("asc")
});

export type CreateMetalInput = z.infer<typeof createMetalSchema>;
export type UpdateMetalInput = z.infer<typeof updateMetalSchema>;
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type CreateAlloyInput = z.infer<typeof createAlloySchema>;
export type MetalQueryInput = z.infer<typeof metalQuerySchema>;
