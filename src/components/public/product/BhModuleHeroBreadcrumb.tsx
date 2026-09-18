import { Link } from 'react-router-dom'
import { useBhModulePageContextOptional } from '@/components/public/product/BhModulePageProvider'
import { BILIRKISI_HESAP_SLUG } from '@/data/canonicalSoftwareProducts'

const BH_PRODUCT_PATH = `/yazilimlar/${BILIRKISI_HESAP_SLUG}`
const BH_MODULES_ANCHOR_HREF = `${BH_PRODUCT_PATH}#hesaplama-modulleri`

/** BH modül detay hero breadcrumb — ortak; son adım CMS başlığından */
export function BhModuleHeroBreadcrumb() {
  const ctx = useBhModulePageContextOptional()
  const current = ctx?.moduleTitle?.trim()
  if (!current) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-5 max-w-3xl">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] leading-snug text-slate-400 sm:text-[13px]">
        <li className="min-w-0">
          <Link
            to={BH_PRODUCT_PATH}
            className="text-slate-300 transition hover:text-white hover:underline hover:underline-offset-2"
          >
            Bilirkişi Hesap
          </Link>
        </li>
        <li aria-hidden className="shrink-0 text-slate-500">
          ›
        </li>
        <li className="min-w-0">
          <Link
            to={BH_MODULES_ANCHOR_HREF}
            className="text-slate-300 transition hover:text-white hover:underline hover:underline-offset-2"
          >
            Hesaplama Modülleri
          </Link>
        </li>
        <li aria-hidden className="shrink-0 text-slate-500">
          ›
        </li>
        <li className="min-w-0 font-medium text-slate-200" aria-current="page">
          {current}
        </li>
      </ol>
    </nav>
  )
}
