import { useEffect, useState } from 'react'

function canUseStorage(): boolean {
  try {
    const key = '__bb_test__'
    window.localStorage.setItem(key, '1')
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined' || !canUseStorage()) {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    if (!canUseStorage()) return
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch {
      // Ignore quota / private mode failures.
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue] as const
}

export function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !canUseStorage()) return fallback
  try {
    const item = window.localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined' || !canUseStorage()) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore.
  }
}
