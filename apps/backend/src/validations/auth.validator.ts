import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Must be a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  rememberMe: z.boolean().optional()
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").optional(),
  department: z.string().optional(),
  password: z.string().min(8, "New password must be at least 8 characters.").optional()
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
