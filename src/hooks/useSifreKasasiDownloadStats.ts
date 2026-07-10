import { useEffect, useState } from 'react'
import { fetchSifreKasasiPublicDownloadStats } from '@/services/adminDownloadStatsService'

export function useSifreKasasiDownloadStats() {
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    void fetchSifreKasasiPublicDownloadStats().then((stats) => {
      if (cancelled || !stats || stats.total <= 0) return
      setTotal(stats.total)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return total
}
