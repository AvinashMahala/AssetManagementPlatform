export interface IUnitRow {
  id: string;
  property_id: string;
  unit_number: string;
  unit_name?: string;
  description?: string;
  unit_type: string;
  status: string;
  floor?: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  furnished: boolean;
  max_occupants?: number;
  unit_amenities: string[];
  unit_photos: string[];
  monthly_rent: number;
  security_deposit: number;
  maintenance_charges?: number;
  created_at: Date;
  updated_at: Date;
}
