import { z } from 'zod';
import { PropertyType, PropertyStatus } from '../core/types/property.types';

/** Address object schema for structured address input.
 */
const AddressObject = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(1),
  country: z.string().optional(),
  landmark: z.string().optional(),
});

/** Amenities object schema for structured amenities input.
 */
const AmenitiesObject = z.object({
  basic: z.array(z.string()).optional().default([]),
  luxury: z.array(z.string()).optional().default([]),
  additionalInfo: z.object({
    petFriendly: z.boolean().optional().default(false),
    smokingAllowed: z.boolean().optional().default(false),
    eventsAllowed: z.boolean().optional().default(false),
    customRules: z.string().optional(),
  }).optional().default({ petFriendly: false, smokingAllowed: false, eventsAllowed: false }),
}).optional();

/** Schema for creating a new property.
 */
export const createPropertySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    // Accept either a single address string (legacy) OR the structured address object
    address: z.union([z.string().min(1), AddressObject]),
    // Accept either legacy 'type' or canonical 'propertyType'
    type: z.nativeEnum(PropertyType).optional(),
    propertyType: z.nativeEnum(PropertyType).optional(),
    description: z.string().optional(),
    // Accept owner fields (optional) — ownerId may be supplied by admin, ownerDetails may be provided
    ownerId: z.string().uuid().optional(),
    ownerDetails: z.object({
      name: z.string().min(1),
      mobileNumbers: z.array(z.string()).optional().default([]),
      emailIds: z.array(z.string()).optional().default([]),
      website: z.string().optional(),
    }).optional(),
    // Accept numeric total area (sq ft). Allow string numbers by preprocessing.
    totalArea: z.preprocess((v) => {
      if (typeof v === 'string') return parseFloat(v as string);
      return v;
    }, z.number().min(1).max(100000)).optional(),
    // Legacy field 'area' accepted and normalized below
    area: z.preprocess((v) => {
      if (typeof v === 'string') return parseFloat(v as string);
      return v;
    }, z.number().min(1).max(100000)).optional(),
    // Allow amenities as either array of strings (legacy) or structured object
    amenities: z.union([z.array(z.string()), AmenitiesObject]).optional(),
    // Legacy image field
    images: z.array(z.string()).optional(),
    // Canonical fields accepted directly
    buildingAmenities: z.array(z.string()).optional(),
    buildingPhotos: z.array(z.string()).optional(),
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
        // also preserve legacy building amenities array for downstream validation
        if (!normalized.buildingAmenities) normalized.buildingAmenities = normalized.amenities.basic;
      }

      // If amenities provided as object, populate buildingAmenities from basic list
      if (normalized.amenities && !normalized.buildingAmenities && typeof normalized.amenities === 'object') {
        normalized.buildingAmenities = normalized.amenities.basic || [];
      }

      // Remove legacy 'type' to avoid ambiguity downstream
      delete normalized.type;

      // Normalize legacy 'area' -> 'totalArea' if present
      if ((normalized as any).area !== undefined && (normalized as any).totalArea === undefined) {
        normalized.totalArea = (normalized as any).area;
      }

      // Ensure numeric totalArea is present if provided
      if ((normalized as any).totalArea !== undefined) {
        normalized.totalArea = Number(normalized.totalArea);
      }

      // Normalize legacy images -> buildingPhotos
      if ((d as any).images && !(normalized as any).buildingPhotos) {
        normalized.buildingPhotos = (d as any).images;
      }

      // If buildingPhotos provided explicitly, ensure it's present
      if ((d as any).buildingPhotos) {
        normalized.buildingPhotos = (d as any).buildingPhotos;
      }

      return normalized;
    }),
});

/** Schema for updating an existing property.
 */
export const updatePropertySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    address: z.union([z.string().min(1), AddressObject]).optional(),
    totalArea: z.preprocess((v) => {
      if (typeof v === 'string') return parseFloat(v as string);
      return v;
    }, z.number().min(1).max(100000)).optional(),
    area: z.preprocess((v) => {
      if (typeof v === 'string') return parseFloat(v as string);
      return v;
    }, z.number().min(1).max(100000)).optional(),
    type: z.nativeEnum(PropertyType).optional(),
    propertyType: z.nativeEnum(PropertyType).optional(),
    description: z.string().optional(),
    ownerId: z.string().uuid().optional(),
    ownerDetails: z.object({
      name: z.string().min(1),
      mobileNumbers: z.array(z.string()).optional().default([]),
      emailIds: z.array(z.string()).optional().default([]),
      website: z.string().optional(),
    }).optional(),
    amenities: z.union([z.array(z.string()), AmenitiesObject]).optional(),
    images: z.array(z.string()).optional(),
    buildingAmenities: z.array(z.string()).optional(),
    buildingPhotos: z.array(z.string()).optional(),
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
      if ((normalized as any).area !== undefined && (normalized as any).totalArea === undefined) {
        normalized.totalArea = (normalized as any).area;
      }
      if ((normalized as any).totalArea !== undefined) normalized.totalArea = Number(normalized.totalArea);
      if (Array.isArray(normalized.amenities)) {
        normalized.amenities = { basic: normalized.amenities, luxury: [], additionalInfo: { petFriendly: false, smokingAllowed: false, eventsAllowed: false } };
        if (!normalized.buildingAmenities) normalized.buildingAmenities = normalized.amenities.basic;
      }

      if (normalized.amenities && !normalized.buildingAmenities && typeof normalized.amenities === 'object') {
        normalized.buildingAmenities = normalized.amenities.basic || [];
      }

      if ((d as any).images && !(normalized as any).buildingPhotos) {
        normalized.buildingPhotos = (d as any).images;
      }

      if ((d as any).buildingPhotos) {
        normalized.buildingPhotos = (d as any).buildingPhotos;
      }
      return normalized;
    }),
});

/** Schema for updating property status.
 */
export const updatePropertyStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.nativeEnum(PropertyStatus),
  }),
});

/** Schema for getting a property by ID.
 */
export const getPropertySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

/** Schema for setting a property template.
 */
export const setPropertyTemplateSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    templateId: z.string().uuid(),
  }),
});
