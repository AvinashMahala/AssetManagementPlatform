import { z } from 'zod';
import { PropertyType, PropertyStatus } from '../core/types/property.types';

const AddressObject = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(1),
  country: z.string().optional(),
  landmark: z.string().optional(),
});

const AmenitiesObject = z.object({
  basic: z.array(z.string()).optional().default([]),
  luxury: z.array(z.string()).optional().default([]),
  additionalInfo: z.object({
    petFriendly: z.boolean().optional().default(false),
    smokingAllowed: z.boolean().optional().default(false),
    eventsAllowed: z.boolean().optional().default(false),
    customRules: z.string().optional(),
  }).optional().default({}),
}).optional();

export const createPropertySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    // Accept either a single address string (legacy) OR the structured address object
    address: z.union([z.string().min(1), AddressObject]),
    // Accept either legacy 'type' or canonical 'propertyType'
    type: z.nativeEnum(PropertyType).optional(),
    propertyType: z.nativeEnum(PropertyType).optional(),
    description: z.string().optional(),
    // Allow amenities as either array of strings (legacy) or structured object
    amenities: z.union([z.array(z.string()), AmenitiesObject]).optional(),
    images: z.array(z.string()).optional(),
  })
  .refine((d) => !!(d.type || d.propertyType), { message: 'propertyType (type) is required' })
  .transform((d) => {
    // Normalize to canonical shape expected by backend types
    const normalized: any = {
      ...d,
      propertyType: (d as any).propertyType ?? (d as any).type,
    };

    if (typeof normalized.address === 'string') {
      normalized.address = {
        street: normalized.address,
        city: '',
        state: '',
        pincode: '',
      };
    }

    if (Array.isArray(normalized.amenities)) {
      normalized.amenities = { basic: normalized.amenities, luxury: [], additionalInfo: { petFriendly: false, smokingAllowed: false, eventsAllowed: false } };
    }

    // Remove legacy 'type' to avoid ambiguity downstream
    delete normalized.type;

    return normalized;
  }),
});

export const updatePropertySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    address: z.union([z.string().min(1), AddressObject]).optional(),
    type: z.nativeEnum(PropertyType).optional(),
    propertyType: z.nativeEnum(PropertyType).optional(),
    description: z.string().optional(),
    amenities: z.union([z.array(z.string()), AmenitiesObject]).optional(),
    images: z.array(z.string()).optional(),
    status: z.nativeEnum(PropertyStatus).optional(),
  })
  .refine((d) => !(d && !(d.type || d.propertyType)), { message: 'propertyType (type) is required when present' })
  .transform((d) => {
    const normalized: any = { ...d };
    if ((d as any).type && !(d as any).propertyType) normalized.propertyType = (d as any).type;
    if (typeof normalized.address === 'string') {
      normalized.address = {
        street: normalized.address,
        city: '',
        state: '',
        pincode: '',
      };
    }
    delete normalized.type;
    if (Array.isArray(normalized.amenities)) {
      normalized.amenities = { basic: normalized.amenities, luxury: [], additionalInfo: { petFriendly: false, smokingAllowed: false, eventsAllowed: false } };
    }
    return normalized;
  }),
});

export const updatePropertyStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.nativeEnum(PropertyStatus),
  }),
});

export const setPropertyTemplateSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    templateId: z.string().uuid(),
  }),
});
