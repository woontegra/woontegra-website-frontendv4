import type { AffiliateListPagination } from '@/types/affiliatePartner'

/** İş ortağı / yönetici liste sayfaları — en fazla 10 kayıt. */
export const AFFILIATE_TABLE_PAGE_SIZE = 10

export function emptyAffiliateListPagination(
  limit = AFFILIATE_TABLE_PAGE_SIZE,
): AffiliateListPagination {
  return { page: 1, limit, total: 0, totalPages: 0 }
}

export function normalizeAffiliateListPagination(
  raw: Partial<AffiliateListPagination> | null | undefined,
  fallbackLimit = AFFILIATE_TABLE_PAGE_SIZE,
): AffiliateListPagination {
  const limit = Number(raw?.limit ?? fallbackLimit) || fallbackLimit
  const page = Math.max(1, Number(raw?.page ?? 1) || 1)
  const total = Math.max(0, Number(raw?.total ?? 0) || 0)
  const totalPages =
    Number(raw?.totalPages) || (total === 0 ? 0 : Math.ceil(total / limit))
  return { page, limit, total, totalPages }
}

type Props = {
  pagination: AffiliateListPagination
  onPageChange: (page: number) => void
  disabled?: boolean
}

/**
 * Önceki | sayfa numaraları | Sonraki
 * Toplam kayıt 10’dan azsa (tek sayfa) gizlenir.
 */
export function AffiliateListPaginationBar({ pagination, onPageChange, disabled }: Props) {
  const { page, total, totalPages } = normalizeAffiliateListPagination(pagination)
  if (totalPages <= 1 || total < AFFILIATE_TABLE_PAGE_SIZE) return null

  const maxButtons = 5
  let start = Math.max(1, page - Math.floor(maxButtons / 2))
  let end = Math.min(totalPages, start + maxButtons - 1)
  start = Math.max(1, end - maxButtons + 1)
  const pages: number[] = []
  for (let p = start; p <= end; p += 1) pages.push(p)

  const btnBase =
    'inline-flex min-h-7 min-w-7 shrink-0 items-center justify-center rounded px-1.5 text-[11px] font-normal transition-colors disabled:cursor-not-allowed disabled:opacity-40'
  const navBtn = `${btnBase} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900`
  const pageBtn = (active: boolean) =>
    active
      ? `${btnBase} bg-slate-800 text-white`
      : `${btnBase} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900`

  return (
    <div className="mt-3 flex max-w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-[11px] text-slate-500 sm:text-left">
        Toplam {total} kayıt · Sayfa {page} / {totalPages}
      </p>
      <nav
        className="flex max-w-full flex-wrap items-center justify-center gap-1.5 sm:justify-end"
        aria-label="Sayfa geçişi"
      >
        <button
          type="button"
          className={navBtn}
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Önceki
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={pageBtn(p === page)}
            disabled={disabled}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          className={navBtn}
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Sonraki
        </button>
      </nav>
    </div>
  )
}
