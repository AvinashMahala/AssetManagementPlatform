export interface IPropertyRow {
  id: string;
  name: string;
  description?: string;
  property_type: string;
  status: string;
  currency: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_pincode: string;
  address_country: string;
  address_landmark?: string;
  area: number;
  total_floors?: number;
  year_built?: number;
  parking_spaces?: number;
  amenities: any; // JSON
  owner_id: string;
  co_owners?: any; // JSON array
  receipt_settings?: any; // JSON
  template_id?: string;
  template_overrides?: any; // JSON
  owner_name: string;
  owner_mobile_numbers: any; // JSON array
  owner_email_ids: any; // JSON array
  owner_website?: string;
  created_at: Date;
  updated_at: Date;
}
