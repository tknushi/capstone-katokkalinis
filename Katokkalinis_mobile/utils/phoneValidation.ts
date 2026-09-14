/**
 * Philippine Mobile Phone Number Validation Utility
 *
 * Rules:
 * - Numeric input only
 * - Maximum & Minimum length: 11 digits
 * - Must start with prefix '09' (e.g., 09XXXXXXXXX)
 */

export interface PhoneValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Strips non-digit characters and limits length to 11 digits.
 */
export function sanitizePhoneNumber(value: string): string {
  return value.replace(/[^0-9]/g, "").slice(0, 11);
}

/**
 * Validates a Philippine mobile number.
 */
export function validatePhilippinePhone(value: string): PhoneValidationResult {
  const clean = sanitizePhoneNumber(value);

  if (!clean) {
    return {
      isValid: false,
      error: "Contact number is required.",
    };
  }

  if (!clean.startsWith("09")) {
    return {
      isValid: false,
      error: "Mobile number must start with 09.",
    };
  }

  if (clean.length < 11) {
    return {
      isValid: false,
      error: "Please enter a valid 11-digit mobile number starting with 09.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Formats a clean 11-digit phone number for display (e.g. 0912 345 6789)
 */
export function formatPhoneNumber(value: string): string {
  const clean = sanitizePhoneNumber(value);
  if (clean.length <= 4) return clean;
  if (clean.length <= 7) return `${clean.slice(0, 4)} ${clean.slice(4)}`;
  return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7, 11)}`;
}
