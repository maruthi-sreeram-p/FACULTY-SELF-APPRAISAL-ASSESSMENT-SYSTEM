import { useCallback, useEffect, useState } from 'react'
import { errorMessage } from './api'

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let live = true
    setLoading(true)
    setError(null)
    fn().then(
      (d) => { if (live) { setData(d); setLoading(false) } },
      (e) => { if (live) { setError(errorMessage(e)); setLoading(false) } },
    )
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  const reload = useCallback(() => setNonce((n) => n + 1), [])
  return { data, setData, error, loading, reload }
}
