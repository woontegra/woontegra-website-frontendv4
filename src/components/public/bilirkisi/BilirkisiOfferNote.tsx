import { useEffect, useState } from 'react'

/** Cihazın yerel saati. 31 Ekim 2026, gün sonu. */
const OFFER_END = new Date(2026, 9, 31, 23, 59, 59)

export const BILIRKISI_OFFER = {
  audience: 'Yeni bilirkişilere özel',
  code: 'BILIRKISI',
  line: 'koduyla %25 indirim',
  validity: '31 Ekim’e kadar geçerli',
  checkoutCue: 'Satın alırken kupon kodunu girin',
} as const

function remainingLabel(now: number): { ended: boolean; label: string } {
  const diff = OFFER_END.getTime() - now
  if (diff <= 0) return { ended: true, label: '' }
  const totalHours = Math.floor(diff / 3_600_000)
  const days = Math.floor(totalHours / 24)
  const hours = String(totalHours % 24).padStart(2, '0')
  return { ended: false, label: `${days} gün ${hours} saat` }
}

function useOfferRemaining() {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const tick = () => setNow(Date.now())
    const id = window.setInterval(tick, 60_000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return remainingLabel(now)
}

function CodePill({ tone }: { tone: 'light' | 'dark' }) {
  return (
    <span
      className={
        tone === 'light'
          ? 'inline-flex shrink-0 items-center rounded-md border border-amber-200 bg-white px-1.5 py-0.5 font-mono text-xs font-semibold tracking-[0.12em] text-slate-900'
          : 'inline-flex shrink-0 items-center rounded-md border border-white/25 bg-white/10 px-1.5 py-0.5 font-mono text-xs font-semibold tracking-[0.12em] text-white'
      }
    >
      {BILIRKISI_OFFER.code}
    </span>
  )
}

export function BilirkisiHomeOfferBox() {
  const remaining = useOfferRemaining()

  return (
    <div className="mt-3 rounded-xl border border-amber-200/90 bg-gradient-to-br from-amber-50 to-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">{BILIRKISI_OFFER.audience}</p>
      <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm font-medium leading-snug text-slate-800">
        <CodePill tone="light" />
        <span>{BILIRKISI_OFFER.line}</span>
      </p>
      <p className="mt-1.5 text-xs text-slate-500">{BILIRKISI_OFFER.validity}</p>
      {remaining.ended ? (
        <p className="mt-2 border-t border-amber-100 pt-2 text-xs font-medium text-slate-500">Kampanya sona erdi</p>
      ) : (
        <p className="mt-2 flex items-baseline justify-between gap-2 border-t border-amber-100 pt-2 text-[11px] text-slate-500">
          <span className="font-medium uppercase tracking-wide">Kalan süre</span>
          <span className="font-semibold tabular-nums text-slate-800">{remaining.label}</span>
        </p>
      )}
    </div>
  )
}

export function BilirkisiOfferHeroNote() {
  return (
    <div className="mt-5 max-w-xl rounded-2xl border border-amber-200/30 bg-white/10 px-4 py-3.5 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200">{BILIRKISI_OFFER.audience}</p>
      <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm font-medium text-white sm:text-base">
        <CodePill tone="dark" />
        <span>{BILIRKISI_OFFER.line}</span>
      </p>
      <p className="mt-1.5 text-xs text-slate-300">{BILIRKISI_OFFER.validity}</p>
      <p className="mt-2 text-xs font-medium text-amber-100">{BILIRKISI_OFFER.checkoutCue}</p>
    </div>
  )
}

export function BilirkisiOfferCheckoutHint() {
  return (
    <p className="text-sm leading-relaxed text-slate-600">
      <span className="font-medium text-slate-800">{BILIRKISI_OFFER.audience}</span>{' '}
      <span className="inline-flex align-middle rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs font-semibold tracking-[0.12em] text-slate-900">
        {BILIRKISI_OFFER.code}
      </span>{' '}
      {BILIRKISI_OFFER.line}
      <span className="mt-1 block text-xs text-slate-500">{BILIRKISI_OFFER.validity}</span>
    </p>
  )
}
