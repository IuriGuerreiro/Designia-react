import { useEffect, useState } from 'react'

/**
 * Debounce hook to delay updating a value
 * Perfect for search inputs to prevent API spam
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 150ms per UX spec)
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = 150): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
