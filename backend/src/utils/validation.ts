import { VALIDATION, ERROR_MESSAGES } from '../constants/validation';
import { PropertyType, PropertyStatus } from '../models/Property';

export class ValidationUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    return VALIDATION.USER.EMAIL.PATTERN.test(email);
  }

  /**
   * Validate string length
   */
  static isValidLength(value: string, min: number, max: number): boolean {
    return value.length >= min && value.length <= max;
  }

  /**
   * Validate positive number
   */
  static isPositiveNumber(value: number): boolean {
    return typeof value === 'number' && value >= 0 && !isNaN(value);
  }

  /**
   * Validate user role
   */
  static isValidUserRole(role: string): boolean {
    return VALIDATION.USER.ROLE.ALLOWED_VALUES.includes(role as any);
  }

  /**
   * Validate property type
   */
  static isValidPropertyType(type: string): boolean {
    return Object.values(PropertyType).includes(type as PropertyType);
  }

  /**
   * Validate property status
   */
  static isValidPropertyStatus(status: string): boolean {
    return Object.values(PropertyStatus).includes(status as PropertyStatus);
  }

  /**
   * Validate pincode format
   */
  static isValidPincode(pincode: string): boolean {
    return VALIDATION.PROPERTY.ADDRESS.PINCODE_PATTERN.test(pincode);
  }

  /**
   * Validate property name
   */
  static validatePropertyName(name: string): { isValid: boolean; message?: string } {
    if (!name || name.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.NAME_REQUIRED };
    }
    if (name.length > VALIDATION.PROPERTY.NAME.MAX_LENGTH) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.NAME_TOO_LONG };
    }
    return { isValid: true };
  }

  /**
   * Validate property description
   */
  static validatePropertyDescription(description?: string): { isValid: boolean; message?: string } {
    if (description && description.length > VALIDATION.PROPERTY.DESCRIPTION.MAX_LENGTH) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.DESCRIPTION_TOO_LONG };
    }
    return { isValid: true };
  }

  /**
   * Validate property type
   */
  static validatePropertyType(type: string): { isValid: boolean; message?: string } {
    if (!this.isValidPropertyType(type)) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.INVALID_PROPERTY_TYPE };
    }
    return { isValid: true };
  }

  /**
   * Validate property status
   */
  static validatePropertyStatus(status?: string): { isValid: boolean; message?: string } {
    if (status && !this.isValidPropertyStatus(status)) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.INVALID_STATUS };
    }
    return { isValid: true };
  }

  /**
   * Validate property area
   */
  static validatePropertyArea(area: number): { isValid: boolean; message?: string } {
    if (area === undefined || area === null) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.AREA_REQUIRED };
    }
    if (!this.isPositiveNumber(area) || area < VALIDATION.PROPERTY.AREA.MIN_VALUE || area > VALIDATION.PROPERTY.AREA.MAX_VALUE) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.AREA_INVALID };
    }
    return { isValid: true };
  }

  /**
   * Validate monthly rent
   */
  static validateMonthlyRent(rent: number): { isValid: boolean; message?: string } {
    if (rent === undefined || rent === null) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.RENT_REQUIRED };
    }
    if (!this.isPositiveNumber(rent)) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.RENT_NEGATIVE };
    }
    return { isValid: true };
  }

  /**
   * Validate security deposit
   */
  static validateSecurityDeposit(deposit?: number): { isValid: boolean; message?: string } {
    if (deposit !== undefined && !this.isPositiveNumber(deposit)) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.SECURITY_DEPOSIT_NEGATIVE };
    }
    return { isValid: true };
  }

  /**
   * Validate maintenance charges
   */
  static validateMaintenanceCharges(charges?: number): { isValid: boolean; message?: string } {
    if (charges !== undefined && !this.isPositiveNumber(charges)) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.MAINTENANCE_CHARGES_NEGATIVE };
    }
    return { isValid: true };
  }

  /**
   * Validate property address
   */
  static validatePropertyAddress(address: any): { isValid: boolean; message?: string } {
    if (!address) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.ADDRESS_REQUIRED };
    }

    if (!address.street || address.street.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.STREET_REQUIRED };
    }
    if (address.street.length > VALIDATION.PROPERTY.ADDRESS.STREET_MAX_LENGTH) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.STREET_TOO_LONG };
    }

    if (!address.city || address.city.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.CITY_REQUIRED };
    }
    if (address.city.length > VALIDATION.PROPERTY.ADDRESS.CITY_MAX_LENGTH) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.CITY_TOO_LONG };
    }

    if (!address.state || address.state.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.STATE_REQUIRED };
    }
    if (address.state.length > VALIDATION.PROPERTY.ADDRESS.STATE_MAX_LENGTH) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.STATE_TOO_LONG };
    }

    if (!address.pincode || !this.isValidPincode(address.pincode)) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.PINCODE_INVALID };
    }

    if (address.landmark && address.landmark.length > VALIDATION.PROPERTY.ADDRESS.LANDMARK_MAX_LENGTH) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.LANDMARK_TOO_LONG };
    }

    return { isValid: true };
  }

  /**
   * Validate property owner
   */
  static validatePropertyOwner(ownerId: number): { isValid: boolean; message?: string } {
    if (!ownerId) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.OWNER_REQUIRED };
    }
    return this.validateId(ownerId);
  }

  /**
   * Validate amenities array
   */
  static validateAmenities(amenities?: string[]): { isValid: boolean; message?: string } {
    if (!amenities) return { isValid: true };

    if (amenities.length > VALIDATION.PROPERTY.AMENITIES.MAX_COUNT) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.AMENITIES_TOO_MANY };
    }

    for (const amenity of amenities) {
      if (amenity.length > VALIDATION.PROPERTY.AMENITIES.MAX_LENGTH) {
        return { isValid: false, message: ERROR_MESSAGES.PROPERTY.AMENITY_TOO_LONG };
      }
    }

    return { isValid: true };
  }

  /**
   * Validate photos array
   */
  static validatePhotos(photos?: string[]): { isValid: boolean; message?: string } {
    if (!photos) return { isValid: true };

    if (photos.length > VALIDATION.PROPERTY.PHOTOS.MAX_COUNT) {
      return { isValid: false, message: ERROR_MESSAGES.PROPERTY.PHOTOS_TOO_MANY };
    }

    for (const photo of photos) {
      if (photo.length > VALIDATION.PROPERTY.PHOTOS.MAX_URL_LENGTH) {
        return { isValid: false, message: ERROR_MESSAGES.PROPERTY.PHOTO_URL_TOO_LONG };
      }
    }

    return { isValid: true };
  }

  /**
   * Validate asset name (legacy - kept for backward compatibility)
   */
  static validateAssetName(name: string): { isValid: boolean; message?: string } {
    if (!name || name.trim().length === 0) {
      return { isValid: false, message: 'Asset name is required' };
    }
    if (name.length > 255) {
      return { isValid: false, message: 'Asset name must be less than 255 characters' };
    }
    return { isValid: true };
  }

  /**
   * Validate asset value (legacy - kept for backward compatibility)
   */
  static validateAssetValue(value?: number): { isValid: boolean; message?: string } {
    if (value !== undefined && !this.isPositiveNumber(value)) {
      return { isValid: false, message: 'Asset value cannot be negative' };
    }
    return { isValid: true };
  }

  /**
   * Validate username
   */
  static validateUsername(username: string): { isValid: boolean; message?: string } {
    if (!username || username.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.USER.USERNAME_REQUIRED };
    }
    if (username.length < VALIDATION.USER.USERNAME.MIN_LENGTH) {
      return { isValid: false, message: ERROR_MESSAGES.USER.USERNAME_TOO_SHORT };
    }
    if (username.length > VALIDATION.USER.USERNAME.MAX_LENGTH) {
      return { isValid: false, message: ERROR_MESSAGES.USER.USERNAME_TOO_LONG };
    }
    return { isValid: true };
  }

  /**
   * Validate email
   */
  static validateEmail(email: string): { isValid: boolean; message?: string } {
    if (!email || email.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.USER.EMAIL_REQUIRED };
    }
    if (email.length > VALIDATION.USER.EMAIL.MAX_LENGTH) {
      return { isValid: false, message: ERROR_MESSAGES.USER.EMAIL_TOO_LONG };
    }
    if (!this.isValidEmail(email)) {
      return { isValid: false, message: ERROR_MESSAGES.USER.EMAIL_INVALID };
    }
    return { isValid: true };
  }

  /**
   * Validate user role
   */
  static validateUserRole(role?: string): { isValid: boolean; message?: string } {
    if (role && !this.isValidUserRole(role)) {
      return { isValid: false, message: ERROR_MESSAGES.USER.ROLE_INVALID };
    }
    return { isValid: true };
  }

  /**
   * Validate phone number
   */
  static validatePhone(phone: string): { isValid: boolean; message?: string } {
    if (!phone || phone.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.USER.PHONE_REQUIRED };
    }
    if (!VALIDATION.USER.PHONE.PATTERN.test(phone)) {
      return { isValid: false, message: ERROR_MESSAGES.USER.PHONE_INVALID };
    }
    return { isValid: true };
  }

  /**
   * Validate ID (must be positive integer)
   */
  static validateId(id: any): { isValid: boolean; message?: string } {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (!Number.isInteger(numId) || numId <= 0) {
      return { isValid: false, message: 'Invalid ID. Must be a positive integer.' };
    }
    return { isValid: true };
  }

  /**
   * Validate tenant first name
   */
  static validateTenantFirstName(firstName: string): { isValid: boolean; message?: string } {
    if (!firstName || firstName.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.TENANT.FIRST_NAME_REQUIRED };
    }
    if (firstName.length > 100) {
      return { isValid: false, message: ERROR_MESSAGES.TENANT.FIRST_NAME_TOO_LONG };
    }
    return { isValid: true };
  }

  /**
   * Validate tenant last name
   */
  static validateTenantLastName(lastName: string): { isValid: boolean; message?: string } {
    if (lastName && lastName.length > 100) {
      return { isValid: false, message: ERROR_MESSAGES.TENANT.LAST_NAME_TOO_LONG };
    }
    return { isValid: true };
  }

  /**
   * Validate tenant email
   */
  static validateTenantEmail(email: string): { isValid: boolean; message?: string } {
    if (!email || email.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.TENANT.EMAIL_REQUIRED };
    }
    if (email.length > 255) {
      return { isValid: false, message: ERROR_MESSAGES.TENANT.EMAIL_TOO_LONG };
    }
    if (!this.isValidEmail(email)) {
      return { isValid: false, message: ERROR_MESSAGES.TENANT.EMAIL_INVALID };
    }
    return { isValid: true };
  }

  /**
   * Validate tenant phone
   */
  static validateTenantPhone(phone: string): { isValid: boolean; message?: string } {
    if (!phone || phone.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.TENANT.PHONE_REQUIRED };
    }
    if (!VALIDATION.USER.PHONE.PATTERN.test(phone)) {
      return { isValid: false, message: ERROR_MESSAGES.TENANT.PHONE_INVALID };
    }
    return { isValid: true };
  }

  /**
   * Validate tenant monthly income
   */
  static validateTenantIncome(income?: number): { isValid: boolean; message?: string } {
    if (income !== undefined && !this.isPositiveNumber(income)) {
      return { isValid: false, message: ERROR_MESSAGES.TENANT.INCOME_NEGATIVE };
    }
    return { isValid: true };
  }

  /**
   * Validate tenant address
   */
  static validateTenantAddress(address: any): { isValid: boolean; message?: string } {
    if (!address) {
      return { isValid: false, message: 'Address is required' };
    }

    if (!address.street || address.street.trim().length === 0) {
      return { isValid: false, message: 'Street address is required' };
    }
    if (address.street.length > 255) {
      return { isValid: false, message: 'Street address must be less than 255 characters' };
    }

    if (!address.city || address.city.trim().length === 0) {
      return { isValid: false, message: 'City is required' };
    }
    if (address.city.length > 100) {
      return { isValid: false, message: 'City must be less than 100 characters' };
    }

    if (!address.state || address.state.trim().length === 0) {
      return { isValid: false, message: 'State is required' };
    }
    if (address.state.length > 100) {
      return { isValid: false, message: 'State must be less than 100 characters' };
    }

    if (!address.pincode || !this.isValidPincode(address.pincode)) {
      return { isValid: false, message: 'Valid pincode is required' };
    }

    return { isValid: true };
  }

  /**
   * Validate emergency contact
   */
  static validateEmergencyContact(contact: any): { isValid: boolean; message?: string } {
    if (!contact) {
      return { isValid: false, message: 'Emergency contact is required' };
    }

    if (!contact.name || contact.name.trim().length === 0) {
      return { isValid: false, message: 'Emergency contact name is required' };
    }
    if (contact.name.length > 255) {
      return { isValid: false, message: 'Emergency contact name must be less than 255 characters' };
    }

    if (!contact.relationship || contact.relationship.trim().length === 0) {
      return { isValid: false, message: 'Emergency contact relationship is required' };
    }
    if (contact.relationship.length > 100) {
      return { isValid: false, message: 'Emergency contact relationship must be less than 100 characters' };
    }

    if (!contact.phone || !VALIDATION.USER.PHONE.PATTERN.test(contact.phone)) {
      return { isValid: false, message: 'Valid emergency contact phone is required' };
    }

    return { isValid: true };
  }

  /**
   * Validate unit property ID
   */
  static validateUnitPropertyId(propertyId: string): { isValid: boolean; message?: string } {
    if (!propertyId || propertyId.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.PROPERTY_ID_REQUIRED };
    }
    return { isValid: true };
  }

  /**
   * Validate unit number
   */
  static validateUnitNumber(unitNumber: string): { isValid: boolean; message?: string } {
    if (!unitNumber || unitNumber.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.UNIT_NUMBER_REQUIRED };
    }
    if (unitNumber.length < VALIDATION.UNIT.UNIT_NUMBER.MIN_LENGTH) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.UNIT_NUMBER_TOO_SHORT };
    }
    if (unitNumber.length > VALIDATION.UNIT.UNIT_NUMBER.MAX_LENGTH) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.UNIT_NUMBER_TOO_LONG };
    }
    return { isValid: true };
  }

  /**
   * Validate unit name
   */
  static validateUnitName(unitName?: string): { isValid: boolean; message?: string } {
    if (unitName && unitName.length > VALIDATION.UNIT.UNIT_NAME.MAX_LENGTH) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.UNIT_NAME_TOO_LONG };
    }
    return { isValid: true };
  }

  /**
   * Validate unit description
   */
  static validateUnitDescription(description?: string): { isValid: boolean; message?: string } {
    if (description && description.length > VALIDATION.UNIT.DESCRIPTION.MAX_LENGTH) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.DESCRIPTION_TOO_LONG };
    }
    return { isValid: true };
  }

  /**
   * Validate unit type
   */
  static validateUnitType(unitType: string): { isValid: boolean; message?: string } {
    if (!unitType || unitType.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.UNIT_TYPE_REQUIRED };
    }
    if (!VALIDATION.UNIT.UNIT_TYPES.includes(unitType as any)) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.UNIT_TYPE_INVALID };
    }
    return { isValid: true };
  }

  /**
   * Validate unit status
   */
  static validateUnitStatus(status?: string): { isValid: boolean; message?: string } {
    if (status && !VALIDATION.UNIT.UNIT_STATUSES.includes(status as any)) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.STATUS_INVALID };
    }
    return { isValid: true };
  }

  /**
   * Validate unit area
   */
  static validateUnitArea(area: number): { isValid: boolean; message?: string } {
    if (area === undefined || area === null) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.AREA_REQUIRED };
    }
    if (!this.isPositiveNumber(area) || area < VALIDATION.UNIT.AREA.MIN_VALUE || area > VALIDATION.UNIT.AREA.MAX_VALUE) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.AREA_INVALID };
    }
    return { isValid: true };
  }

  /**
   * Validate unit floor
   */
  static validateUnitFloor(floor?: number): { isValid: boolean; message?: string } {
    if (floor !== undefined && (floor < VALIDATION.UNIT.FLOOR.MIN_VALUE || floor > VALIDATION.UNIT.FLOOR.MAX_VALUE)) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.FLOOR_INVALID };
    }
    return { isValid: true };
  }

  /**
   * Validate unit bedrooms
   */
  static validateUnitBedrooms(bedrooms?: number): { isValid: boolean; message?: string } {
    if (bedrooms !== undefined && (bedrooms < VALIDATION.UNIT.BEDROOMS.MIN_VALUE || bedrooms > VALIDATION.UNIT.BEDROOMS.MAX_VALUE)) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.BEDROOMS_INVALID };
    }
    return { isValid: true };
  }

  /**
   * Validate unit bathrooms
   */
  static validateUnitBathrooms(bathrooms?: number): { isValid: boolean; message?: string } {
    if (bathrooms !== undefined && (bathrooms < VALIDATION.UNIT.BATHROOMS.MIN_VALUE || bathrooms > VALIDATION.UNIT.BATHROOMS.MAX_VALUE)) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.BATHROOMS_INVALID };
    }
    return { isValid: true };
  }

  /**
   * Validate unit balconies
   */
  static validateUnitBalconies(balconies?: number): { isValid: boolean; message?: string } {
    if (balconies !== undefined && (balconies < VALIDATION.UNIT.BALCONIES.MIN_VALUE || balconies > VALIDATION.UNIT.BALCONIES.MAX_VALUE)) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.BALCONIES_INVALID };
    }
    return { isValid: true };
  }

  /**
   * Validate unit max occupants
   */
  static validateUnitMaxOccupants(maxOccupants?: number): { isValid: boolean; message?: string } {
    if (maxOccupants !== undefined && (maxOccupants < VALIDATION.UNIT.MAX_OCCUPANTS.MIN_VALUE || maxOccupants > VALIDATION.UNIT.MAX_OCCUPANTS.MAX_VALUE)) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.MAX_OCCUPANTS_INVALID };
    }
    return { isValid: true };
  }

  /**
   * Validate unit monthly rent
   */
  static validateUnitMonthlyRent(rent: number): { isValid: boolean; message?: string } {
    if (rent === undefined || rent === null) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.RENT_REQUIRED };
    }
    if (!this.isPositiveNumber(rent)) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.RENT_NEGATIVE };
    }
    return { isValid: true };
  }

  /**
   * Validate unit security deposit
   */
  static validateUnitSecurityDeposit(deposit: number): { isValid: boolean; message?: string } {
    if (deposit === undefined || deposit === null) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.SECURITY_DEPOSIT_NEGATIVE };
    }
    if (!this.isPositiveNumber(deposit)) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.SECURITY_DEPOSIT_NEGATIVE };
    }
    return { isValid: true };
  }

  /**
   * Validate unit maintenance charges
   */
  static validateUnitMaintenanceCharges(charges?: number): { isValid: boolean; message?: string } {
    if (charges !== undefined && !this.isPositiveNumber(charges)) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.MAINTENANCE_CHARGES_NEGATIVE };
    }
    return { isValid: true };
  }

  /**
   * Validate unit amenities array
   */
  static validateUnitAmenities(amenities?: string[]): { isValid: boolean; message?: string } {
    if (!amenities) return { isValid: true };

    if (amenities.length > VALIDATION.UNIT.AMENITIES.MAX_COUNT) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.AMENITIES_TOO_MANY };
    }

    for (const amenity of amenities) {
      if (amenity.length > VALIDATION.UNIT.AMENITIES.MAX_LENGTH) {
        return { isValid: false, message: ERROR_MESSAGES.UNIT.AMENITY_TOO_LONG };
      }
    }

    return { isValid: true };
  }

  /**
   * Validate unit photos array
   */
  static validateUnitPhotos(photos?: string[]): { isValid: boolean; message?: string } {
    if (!photos) return { isValid: true };

    if (photos.length > VALIDATION.UNIT.PHOTOS.MAX_COUNT) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT.PHOTOS_TOO_MANY };
    }

    for (const photo of photos) {
      if (photo.length > VALIDATION.UNIT.PHOTOS.MAX_URL_LENGTH) {
        return { isValid: false, message: ERROR_MESSAGES.UNIT.PHOTO_URL_TOO_LONG };
      }
    }

    return { isValid: true };
  }

  /**
   * Validate unit-tenant unit ID
   */
  static validateUnitTenantUnitId(unitId: string): { isValid: boolean; message?: string } {
    if (!unitId || unitId.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT_TENANT.UNIT_ID_REQUIRED };
    }
    return { isValid: true };
  }

  /**
   * Validate unit-tenant tenant ID
   */
  static validateUnitTenantTenantId(tenantId: string): { isValid: boolean; message?: string } {
    if (!tenantId || tenantId.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT_TENANT.TENANT_ID_REQUIRED };
    }
    return { isValid: true };
  }

  /**
   * Validate unit-tenant rent share
   */
  static validateUnitTenantRentShare(rentShare: number): { isValid: boolean; message?: string } {
    if (rentShare === undefined || rentShare === null) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT_TENANT.RENT_SHARE_NEGATIVE };
    }
    if (!this.isPositiveNumber(rentShare)) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT_TENANT.RENT_SHARE_NEGATIVE };
    }
    return { isValid: true };
  }

  /**
   * Validate unit-tenant security deposit share
   */
  static validateUnitTenantSecurityDepositShare(depositShare: number): { isValid: boolean; message?: string } {
    if (depositShare === undefined || depositShare === null) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT_TENANT.SECURITY_DEPOSIT_SHARE_NEGATIVE };
    }
    if (!this.isPositiveNumber(depositShare)) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT_TENANT.SECURITY_DEPOSIT_SHARE_NEGATIVE };
    }
    return { isValid: true };
  }

  /**
   * Validate unit-tenant status
   */
  static validateUnitTenantStatus(status?: string): { isValid: boolean; message?: string } {
    if (status && !VALIDATION.UNIT_TENANT.STATUSES.includes(status as any)) {
      return { isValid: false, message: ERROR_MESSAGES.UNIT_TENANT.STATUS_INVALID };
    }
    return { isValid: true };
  }

  /**
   * Validate rent payment lease ID
   */
  static validateRentPaymentLeaseId(leaseId: string): { isValid: boolean; message?: string } {
    if (!leaseId || leaseId.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.RENT_PAYMENT.LEASE_REQUIRED };
    }
    return { isValid: true };
  }

  /**
   * Validate rent payment amount
   */
  static validateRentPaymentAmount(amount: number): { isValid: boolean; message?: string } {
    if (amount === undefined || amount === null) {
      return { isValid: false, message: ERROR_MESSAGES.RENT_PAYMENT.AMOUNT_REQUIRED };
    }
    if (!this.isPositiveNumber(amount)) {
      return { isValid: false, message: ERROR_MESSAGES.RENT_PAYMENT.AMOUNT_NEGATIVE };
    }
    return { isValid: true };
  }

  /**
   * Validate rent payment due date
   */
  static validateRentPaymentDueDate(dueDate: Date): { isValid: boolean; message?: string } {
    if (!dueDate) {
      return { isValid: false, message: ERROR_MESSAGES.RENT_PAYMENT.DUE_DATE_REQUIRED };
    }
    if (dueDate < new Date()) {
      return { isValid: false, message: 'Due date cannot be in the past' };
    }
    return { isValid: true };
  }

  /**
   * Validate rent payment late fee
   */
  static validateRentPaymentLateFee(lateFee?: number): { isValid: boolean; message?: string } {
    if (lateFee !== undefined && !this.isPositiveNumber(lateFee)) {
      return { isValid: false, message: ERROR_MESSAGES.RENT_PAYMENT.LATE_FEE_NEGATIVE };
    }
    return { isValid: true };
  }
}