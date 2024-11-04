// File: frontend/src/utils/validation.ts
import { z } from 'zod'

// Common validation patterns
const patterns = {
  // Basic IP address validation pattern
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  // Basic FQDN validation pattern
  fqdn: /^(?!-)[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
}

// Validation schemas for ping tool
export const pingValidation = {
  target: z.string()
    .min(1, 'Target is required')
    .max(255, 'Target is too long')
    .refine(
      (val) => patterns.ipv4.test(val) || patterns.fqdn.test(val),
      'Invalid IP address or domain name'
    ),
  count: z.number()
    .int('Must be a whole number')
    .min(1, 'Minimum count is 1')
    .max(30, 'Maximum count is 30'),
}

// Validation schemas for dig tool
export const digValidation = {
  domain: z.string()
    .min(1, 'Domain is required')
    .max(255, 'Domain is too long')
    .refine(
      (val) => patterns.fqdn.test(val),
      'Invalid domain name'
    ),
  recordType: z.enum(['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME', 'SOA'], {
    errorMap: () => ({ message: 'Invalid record type' }),
  }),
}

// Utility functions for form validation
export const validateInput = async <T>(
  schema: z.ZodType<T>,
  value: unknown
): Promise<{ success: true; data: T } | { success: false; error: string }> => {
  try {
    const data = await schema.parseAsync(value)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Validation failed' }
  }
}