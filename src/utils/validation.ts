export function sanitizeInput(input: string): string {
  // Basic XSS prevention: remove script tags, etc.
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/<[^>]*>/g, '') // Remove all HTML tags
              .trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/; // Brazilian format
  return phoneRegex.test(phone);
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}
