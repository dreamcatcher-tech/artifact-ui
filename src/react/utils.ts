import equal from 'fast-deep-equal'
import { useCallback, useState } from 'react'

export const tryParse = (value: string) => {
  if (value === '') {
    return ''
  }

  try {
    return JSON.parse(value)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return value === undefined ? null : value
    }
  }
}

export const useDeepState = <T>(initial: T) => {
  const [state, setState] = useState<T>(initial)
  const setDeepState = useCallback((next: T) => {
    setState((current) => {
      if (equal(current, next)) {
        return current
      }
      return next
    })
  }, [])
  return [state, setDeepState] as const
}
