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
}