import { format, formatDistanceToNow, addHours, isPast, isFuture, differenceInSeconds } from 'date-fns'

/**
 * Convert Firestore Timestamp to JS Date
 */
export const toDate = (timestamp) => {
  if (!timestamp) return null
  if (timestamp?.toDate) return timestamp.toDate()
  if (timestamp instanceof Date) return timestamp
  return new Date(timestamp)
}

/**
 * Format a Firestore timestamp for display
 */
export const formatDate = (timestamp, fmt = 'dd MMM yyyy') => {
  const date = toDate(timestamp)
  if (!date) return '—'
  return format(date, fmt)
}

export const formatDateTime = (timestamp) => formatDate(timestamp, 'dd MMM yyyy, h:mm a')
export const formatTime = (timestamp) => formatDate(timestamp, 'h:mm a')
export const timeAgo = (timestamp) => {
  const date = toDate(timestamp)
  if (!date) return '—'
  return formatDistanceToNow(date, { addSuffix: true })
}

/**
 * Calculate rental end time from start + duration hours
 */
export const calcEndTime = (startTime, durationHours) => {
  const start = toDate(startTime) || new Date()
  return addHours(start, durationHours)
}

/**
 * Get seconds remaining until a date
 */
export const secondsUntil = (timestamp) => {
  const date = toDate(timestamp)
  if (!date) return 0
  return Math.max(0, differenceInSeconds(date, new Date()))
}

/**
 * Check if a timestamp is in the past
 */
export const isExpired = (timestamp) => {
  const date = toDate(timestamp)
  if (!date) return false
  return isPast(date)
}

/**
 * Format seconds into HH:MM:SS countdown string
 */
export const formatCountdown = (totalSeconds) => {
  if (totalSeconds <= 0) return '00:00:00'
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

/**
 * Rental duration options with prices
 * These come from admin settings per tool but this is the shape
 */
export const DURATION_OPTIONS = [
  { hours: 6,  label: '6 Hours' },
  { hours: 12, label: '12 Hours' },
  { hours: 24, label: '24 Hours' },
]
