import { z } from 'zod';
import { PropertyType, PropertyStatus } from '../core/types/property.types';

export const createPropertySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    address: z.string().min(1),
    type: z.nativeEnum(PropertyType),
    description: z.string().optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
  }),
});

export const updatePropertySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    address: z.string().min(1).optional(),
    type: z.nativeEnum(PropertyType).optional(),
    description: z.string().optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    status: z.nativeEnum(PropertyStatus).optional(),
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
