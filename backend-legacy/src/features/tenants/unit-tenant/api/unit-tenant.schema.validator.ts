import { z } from 'zod';
import { VALIDATION } from '@/shared/constants/validation';

export const assignTenantSchema = z.object({
  unitId: z.string().min(1, 'unitId is required'),
  tenantId: z.string().min(1, 'tenantId is required'),
  isPrimaryTenant: z.boolean().optional(),
  moveInDate: z.string().transform((s) => new Date(s)).optional(),
  moveOutDate: z.string().transform((s) => new Date(s)).optional(),
  monthlyRentShare: z.number().nonnegative().optional(),
  securityDepositShare: z.number().nonnegative().optional(),
  status: z.string().optional().refine((v) => !v || VALIDATION.UNIT_TENANT.STATUSES.includes(v as any), {
    message: `status must be one of: ${VALIDATION.UNIT_TENANT.STATUSES.join(', ')}`,
  }),
});

export const updateAssignmentSchema = assignTenantSchema.partial();

export const queryAssignmentsSchema = z.object({
  unitId: z.string().optional(),
  tenantId: z.string().optional(),
});

export default {
  assignTenantSchema,
  updateAssignmentSchema,
  queryAssignmentsSchema,
};
