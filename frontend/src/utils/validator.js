/**
 * Lightweight, reusable Form Validation Utility Class
 */
export class Validator {
  /**
   * Check if a string is non-empty after trimming
   */
  static isNotEmpty(value) {
    if (value === null || value === undefined) return false;
    return String(value).trim().length > 0;
  }

  /**
   * Validate Email Address Format
   */
  static isValidEmail(email) {
    if (!email) return true; // Optional field check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(email).trim());
  }

  /**
   * Validate 10-Digit Indian Mobile / Phone Number
   */
  static isValidMobile(mobile) {
    if (!mobile) return true; // Optional field check
    const digitsOnly = String(mobile).replace(/[\s\-\+\(\)]/g, '');
    return /^[0-9]{10}$/.test(digitsOnly);
  }

  /**
   * Validate 15-Character Indian GSTIN Format
   */
  static isValidGstin(gstin) {
    if (!gstin) return true; // Optional field check
    const trimmed = String(gstin).trim();
    if (trimmed.length !== 15) return false;
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
    return gstinRegex.test(trimmed);
  }

  /**
   * Check if a number is positive (> 0)
   */
  static isPositiveNumber(val) {
    const num = Number(val);
    return !isNaN(num) && num > 0;
  }

  /**
   * Validate a Form Object against a set of rules
   * @param {Object} formData - Object containing form field values
   * @param {Object} rules - Rules definition: { fieldName: { required, email, mobile, gstin, minLength, positive } }
   * @returns {Object} { isValid: boolean, errors: { [field]: string } }
   */
  static validate(formData, rules) {
    const errors = {};

    for (const [field, fieldRules] of Object.entries(rules)) {
      const val = formData[field];

      if (fieldRules.required && !Validator.isNotEmpty(val)) {
        errors[field] = fieldRules.requiredMsg || `${fieldRules.label || field} is required.`;
        continue;
      }

      if (fieldRules.email && val && !Validator.isValidEmail(val)) {
        errors[field] = fieldRules.emailMsg || 'Please enter a valid email address.';
      }

      if (fieldRules.mobile && val && !Validator.isValidMobile(val)) {
        errors[field] = fieldRules.mobileMsg || 'Please enter a valid 10-digit mobile number.';
      }

      if (fieldRules.gstin && val && !Validator.isValidGstin(val)) {
        errors[field] = fieldRules.gstinMsg || 'Please enter a valid 15-character GSTIN (e.g. 24AAAAA0000A1Z5).';
      }

      if (fieldRules.minLength && val && String(val).length < fieldRules.minLength) {
        errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.minLength} characters.`;
      }

      if (fieldRules.positive && (val !== '' && val !== undefined)) {
        if (!Validator.isPositiveNumber(val)) {
          errors[field] = `${fieldRules.label || field} must be a positive number greater than 0.`;
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

export default Validator;
