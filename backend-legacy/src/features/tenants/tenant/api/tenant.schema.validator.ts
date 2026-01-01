import { z } from 'zod';
import { TenantStatus } from '../models/tenant.types';

const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(1, 'Pincode is required'),
});

const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().min(1, 'Phone is required'),
});

export const createTenantSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  dateOfBirth: z.string().transform((str) => new Date(str)).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  occupation: z.string().optional(),
  companyName: z.string().optional(),
  monthlyIncome: z.number().optional(),
  currentAddress: addressSchema,
  permanentAddress: addressSchema.optional(),
  emergencyContact: emergencyContactSchema.optional(),
  status: z.nativeEnum(TenantStatus).default(TenantStatus.ACTIVE),
});

export const updateTenantSchema = createTenantSchema.partial();
