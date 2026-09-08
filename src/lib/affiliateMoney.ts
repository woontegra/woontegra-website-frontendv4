/** Kuruş → Türk Lirası metni (backend özet alanlarıyla aynı format). */
export function formatAffiliateTry(kurus: number | null | undefined): string {
  const n = typeof kurus === 'number' && Number.isFinite(kurus) ? kurus : 0
  const amount = (n / 100).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  // NBSP: "2.000,00" ile "TL" satır kırılmasında ayrılmasın
  return `${amount}\u00A0TL`
}

/** Satış/komisyon masaüstü tablosu — kaydırmasız, kartı doldurur. */
export const affSales = {
  partnerTable: 'w-full table-fixed',
  adminTable: 'w-full table-fixed',
  th: 'px-1.5 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500',
  td: 'px-1.5 py-2 align-middle text-slate-700',
  nowrap: 'whitespace-nowrap',
  money: 'whitespace-nowrap text-right tabular-nums',
  /** Kelime kırılımı, en fazla 2 satır; harf harf bölme yok */
  package: 'break-words [overflow-wrap:break-word] [word-break:normal] line-clamp-2',
} as const

/**
 * Ödeme tabloları (dokunulmadı / mevcut davranış).
 */
export const affTable = {
  salesTable: 'w-full min-w-[1340px]',
  adminSalesTable: 'w-full min-w-[1480px]',
  payoutTable: 'w-full table-fixed min-w-[36rem]',
  adminPayoutTable: 'w-full table-fixed min-w-[42rem]',
  th: 'whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500',
  td: 'whitespace-nowrap px-3 py-2.5 align-middle text-slate-700',
  date: 'min-w-[150px] whitespace-nowrap tabular-nums',
  money: 'whitespace-nowrap text-right tabular-nums',
  rate: 'whitespace-nowrap text-right tabular-nums',
  status: 'whitespace-nowrap',
  saleType: 'whitespace-nowrap',
  package: 'min-w-[240px] whitespace-nowrap',
  method: 'whitespace-nowrap',
  grow: 'w-full',
} as const

export function formatAffiliateDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
