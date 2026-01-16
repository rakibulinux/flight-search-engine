import type { SearchParams } from '@/types'

/**
 * Validate IATA airport code
 */
export function isValidIataCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code.toUpperCase())
}

/**
 * Validate date string (YYYY-MM-DD)
 */
export function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false

  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/**
 * Check if date is in the future
 */
export function isFutureDate(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date >= today
}

/**
 * Validate return date is after departure
 */
export function isValidReturnDate(departureDate: string, returnDate: string): boolean {
  if (!returnDate) return true
  return new Date(returnDate) >= new Date(departureDate)
}

/**
 * Validate search parameters
 */
export function validateSearchParams(
  params: Partial<SearchParams>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  if (!params.origin) {
    errors.origin = 'Origin is required'
  } else if (!isValidIataCode(params.origin)) {
    errors.origin = 'Invalid airport code'
  }

  if (!params.destination) {
    errors.destination = 'Destination is required'
  } else if (!isValidIataCode(params.destination)) {
    errors.destination = 'Invalid airport code'
  }

  if (params.origin && params.destination && params.origin === params.destination) {
    errors.destination = 'Origin and destination must be different'
  }

  if (!params.departureDate) {
    errors.departureDate = 'Departure date is required'
  } else if (!isValidDate(params.departureDate)) {
    errors.departureDate = 'Invalid date format'
  } else if (!isFutureDate(params.departureDate)) {
    errors.departureDate = 'Departure date must be in the future'
  }

  if (params.returnDate) {
    if (!isValidDate(params.returnDate)) {
      errors.returnDate = 'Invalid date format'
    } else if (!isValidReturnDate(params.departureDate!, params.returnDate)) {
      errors.returnDate = 'Return date must be after departure'
    }
  }

  if (params.adults !== undefined && (params.adults < 1 || params.adults > 9)) {
    errors.adults = 'Adults must be between 1 and 9'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Sanitize IATA code
 */
export function sanitizeIataCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)
}
