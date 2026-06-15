import { useState, useEffect } from 'react'
import { loadNormieIndex, type NormieIndex } from '../lib/index'

export function useNormieIndex() {
  const [index, setIndex] = useState<NormieIndex | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    loadNormieIndex()
      .then((data) => {
        if (!cancelled) {
          setIndex(data)
          setLoading(false)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { index, loading, error }
}
