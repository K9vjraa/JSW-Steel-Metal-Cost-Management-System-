/**
 * Data Transfer Objects (DTOs) for MCMS API.
 * These are typed request / response shapes independent of Prisma models.
 */

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ProfileUpdateDto {
  name?: string;
  department?: string;
  password?: string;
}

export interface AuthUserDto {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string | null;
}

export interface AuthSessionDto {
  accessToken: string;
  user: AuthUserDto;
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  department?: string;
  status?: "ACTIVE" | "INACTIVE";
  roleId: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  department?: string;
  status?: "ACTIVE" | "INACTIVE";
  roleId?: string;
}

export interface UserListItemDto {
  id: string;
  name: string;
  email: string;
  department: string | null;
  status: string;
  lastLoginAt: Date | null;
  role: { id: string; name: string };
}

// ── Metals ────────────────────────────────────────────────────────────────────

export interface CreateMetalDto {
  name: string;
  code: string;
  category: string;
  unit?: string;
  status?: "ACTIVE" | "INACTIVE";
  description?: string;
}

export type UpdateMetalDto = Partial<CreateMetalDto>;

export interface MetalFilterDto {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

// ── Grades ────────────────────────────────────────────────────────────────────

export interface CreateGradeDto {
  metalId: string;
  name: string;
  subGrade?: string | null;
  multiplier: number;
  extraPrice?: number;
  status?: "ACTIVE" | "INACTIVE";
  mechanicalProperties?: Record<string, string>;
  toleranceProperties?: Record<string, string>;
  bendProperties?: Record<string, string>;
  chemicalComposition?: Record<string, string>;
}

export type UpdateGradeDto = Partial<CreateGradeDto>;

export interface GradeFilterDto {
  metalId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

// ── Calculations ──────────────────────────────────────────────────────────────

export interface CalculationItemDto {
  metalId?: string | null;
  rawMaterialId?: string | null;
  gradeId?: string | null;
  quantity: number;
  compositionPct?: number | null;
}

export interface ChargeDto {
  name: string;
  kind: "GST" | "ADDITIONAL";
  rate?: number | null;
  amount?: number | null;
  taxable?: boolean;
}

export interface CreateCalculationDto {
  name?: string;
  mode: "metal" | "alloy" | "raw-material";
  alloyId?: string | null;
  items: CalculationItemDto[];
  charges?: ChargeDto[];
}

export interface CalculationFilterDto {
  status?: string;
  search?: string;
  from?: string;
  to?: string;
  mode?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

// ── Reports ───────────────────────────────────────────────────────────────────

export interface CreateReportDto {
  name: string;
  type: "cost-summary" | "trend" | "comparison" | "audit" | "custom";
  filters?: Record<string, unknown>;
}

export interface ReportFilterDto {
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface DateRangeDto {
  from: Date;
  to: Date;
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface CreateNotificationDto {
  userId?: string;
  title: string;
  message: string;
  category: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
}

export interface NotificationFilterDto {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

// ── Settings ──────────────────────────────────────────────────────────────────

export interface UpdateSettingDto {
  value: string;
  label?: string;
  description?: string;
}

export interface BulkUpdateSettingsDto {
  [key: string]: string;
}

export interface CreateGstSlabDto {
  name: string;
  code: string;
  rate: number;
  description?: string;
  active?: boolean;
}

export type UpdateGstSlabDto = Partial<CreateGstSlabDto>;

// ── Prices ────────────────────────────────────────────────────────────────────

export interface CreatePriceDto {
  metalId?: string | null;
  rawMaterialId?: string | null;
  supplierId?: string | null;
  pricePerUnit: number;
  currency?: string;
  unit?: string;
  source: string;
  location?: string;
  effectiveFrom: Date | string;
  active?: boolean;
  reason?: string;
}

// ── Suppliers ─────────────────────────────────────────────────────────────────

export interface CreateSupplierDto {
  name: string;
  code: string;
  contactName?: string;
  email: string;
  phone?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export type UpdateSupplierDto = Partial<CreateSupplierDto>;

// ── Raw Materials ─────────────────────────────────────────────────────────────

export interface CreateRawMaterialDto {
  name: string;
  code: string;
  unit?: string;
  status?: "ACTIVE" | "INACTIVE";
  description?: string;
}

export type UpdateRawMaterialDto = Partial<CreateRawMaterialDto>;

// ── Alloys ────────────────────────────────────────────────────────────────────

export interface AlloyComponentDto {
  metalId?: string | null;
  gradeId?: string | null;
  rawMaterialId?: string | null;
  compositionPercent: number;
  quantity?: number | null;
}

export interface CreateAlloyDto {
  name: string;
  code: string;
  type: string;
  status?: "ACTIVE" | "INACTIVE";
  components: AlloyComponentDto[];
}

export type UpdateAlloyDto = Partial<CreateAlloyDto>;

// ── Audit ─────────────────────────────────────────────────────────────────────

export interface AuditLogFilterDto {
  entity?: string;
  userId?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
