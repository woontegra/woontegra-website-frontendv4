import { Download } from 'lucide-react'
import { useSifreKasasiDownloadStats } from '@/hooks/useSifreKasasiDownloadStats'

/** Şifre Kasası ürün sayfasında opsiyonel indirme sayacı — hata durumunda gizlenir. */
export function SifreKasasiDownloadCounter() {
  const total = useSifreKasasiDownloadStats()
  if (total == null || total <= 0) return null

  return (
    <p className="relative mt-4 flex items-center gap-2 rounded-2xl border border-sky-200/80 bg-sky-50/90 px-4 py-3 text-sm text-sky-950">
      <Download className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
      <span>
        Bugüne kadar <strong>{total.toLocaleString('tr-TR')}</strong> kez indirildi
      </span>
    </p>
  )
}
