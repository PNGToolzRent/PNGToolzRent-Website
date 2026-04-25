import { useState, useEffect } from 'react'
import { secondsUntil, formatCountdown } from '../utils/dates'

export const useCountdown = (timestamp) => {
  const [seconds, setSeconds] = useState(() => secondsUntil(timestamp))

  useEffect(() => {
    if (!timestamp) return
    setSeconds(secondsUntil(timestamp))
    const interval = setInterval(() => {
      const remaining = secondsUntil(timestamp)
      setSeconds(remaining)
      if (remaining <= 0) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  }, [timestamp])

  return {
    seconds,
    formatted: formatCountdown(seconds),
    isExpired: seconds <= 0,
    isWarning: seconds > 0 && seconds <= 1800, // 30 min warning
  }
}
