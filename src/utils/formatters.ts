import { format, parseISO, differenceInMinutes } from 'date-fns'

/**
 * Format price with currency
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format ISO8601 duration to human readable format
 * Example: PT2H30M -> 2h 30m
 */
export function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return isoDuration

  const hours = match[1] ? parseInt(match[1], 10) : 0
  const minutes = match[2] ? parseInt(match[2], 10) : 0

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

/**
 * Calculate duration in minutes from ISO8601 duration
 */
export function durationToMinutes(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return 0

  const hours = match[1] ? parseInt(match[1], 10) : 0
  const minutes = match[2] ? parseInt(match[2], 10) : 0

  return hours * 60 + minutes
}

/**
 * Format time from ISO date string
 */
export function formatTime(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'HH:mm')
  } catch {
    return isoDate
  }
}

/**
 * Format date from ISO date string
 */
export function formatDate(isoDate: string, formatStr: string = 'MMM d, yyyy'): string {
  try {
    return format(parseISO(isoDate), formatStr)
  } catch {
    return isoDate
  }
}

/**
 * Format date for display in compact form
 */
export function formatDateCompact(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'EEE, MMM d')
  } catch {
    return isoDate
  }
}

/**
 * Get hour from ISO date (0-24)
 */
export function getHourFromDate(isoDate: string): number {
  try {
    const date = parseISO(isoDate)
    return date.getHours() + date.getMinutes() / 60
  } catch {
    return 0
  }
}

/**
 * Format stops text
 */
export function formatStops(stops: number): string {
  if (stops === 0) return 'Nonstop'
  if (stops === 1) return '1 stop'
  return `${stops} stops`
}

/**
 * Calculate flight duration between two times
 */
export function calculateDuration(departure: string, arrival: string): string {
  try {
    const minutes = differenceInMinutes(parseISO(arrival), parseISO(departure))
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  } catch {
    return ''
  }
}

/**
 * Format relative time
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return format(new Date(timestamp), 'MMM d')
}
