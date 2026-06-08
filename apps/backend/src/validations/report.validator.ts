import { z } from "zod";

export const createReportSchema = z.object({
  name: z.string().min(2, "Report name must be at least 2 characters."),
  type: z
    .enum(["cost-summary", "trend", "comparison", "audit", "custom"])
    .default("cost-summary"),
  filters: z.record(z.unknown()).default({})
});

export const reportQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(10),
  type: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).default("desc")
});

export const dateRangeSchema = z.object({
  from: z.coerce
    .date()
    .optional()
    .default(() => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
  to: z.coerce
    .date()
    .optional()
    .default(() => new Date())
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type ReportQueryInput = z.infer<typeof reportQuerySchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
