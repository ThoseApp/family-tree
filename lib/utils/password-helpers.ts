/**
 * Password generation utilities for user account creation
 */

/**
 * Generate a random password with standard security constraints
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export function generateSecurePassword(length: number = 12): string {
  if (length < 8) {
    throw new Error("Password length must be at least 8 characters");
  }

  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  // Removed potentially problematic characters that might cause issues in URLs, emails, or certain systems
  const special = "!@#$%^&*()_+-=";

  // Use crypto.getRandomValues for cryptographically secure randomness
  const getRandomIndex = (max: number): number => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  };

  // Ensure at least one character from each required category
  let password = "";
  password += uppercase[getRandomIndex(uppercase.length)];
  password += lowercase[getRandomIndex(lowercase.length)];
  password += numbers[getRandomIndex(numbers.length)];
  password += special[getRandomIndex(special.length)];

  // Fill remaining length with random characters from all categories
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = 4; i < length; i++) {
    password += allChars[getRandomIndex(allChars.length)];
  }

  // Use Fisher-Yates shuffle algorithm for proper randomization
  const passwordArray = password.split("");
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = getRandomIndex(i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join("");
}

/**
 * Validate password meets security requirements
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate multiple secure passwords
 */
export function generateMultiplePasswords(
  count: number,
  length: number = 12
): string[] {
  return Array.from({ length: count }, () => generateSecurePassword(length));
}
