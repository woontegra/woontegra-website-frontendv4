import { useEffect, useState } from 'react'

/**
 * KoopPlus üst bölümündeki hareketli "aidat çizelgesi".
 * Satırlarda üyeler, sütunlarda aylar; ödemeler geldikçe kutucuklar yeşile döner,
 * tahsilat oranı halkası dolar, toplanan aidat artar. Tüm sütunlar dolunca çizelge baştan başlar.
 * Örnek verilerle gösterimdir. "Hareketi azalt" tercihinde çizelge sabit kalır.
 */

const MEMBERS = ['Üye 01', 'Üye 02', 'Üye 03', 'Üye 04', 'Üye 05', 'Üye 06']
const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz']
const DUE_TL = 2500
const STEP_MS = 700

type Cell = 'paid' | 'late' | 'open'

/** Başlangıç durumu: ilk aylar çoğunlukla ödenmiş, birkaç gecikme var. Satır = üye, sütun = ay. */
const INITIAL: Cell[][] = [
  ['paid', 'paid', 'paid', 'open', 'open', 'open'],
  ['paid', 'paid', 'late', 'open', 'open', 'open'],
  ['paid', 'paid', 'paid', 'paid', 'open', 'open'],
  ['paid', 'late', 'late', 'open', 'open', 'open'],
  ['paid', 'paid', 'paid', 'open', 'open', 'open'],
  ['paid', 'paid', 'open', 'open', 'open', 'open'],
]

/** Ödemelerin geliş sırası (üye, ay): önce gecikmeler kapanır, sonra aylar sırayla dolar. */
const PAY_ORDER: [number, number][] = [
  [3, 1], [1, 2], [5, 2], [3, 2], [0, 3], [1, 3], [3, 3], [4, 3], [5, 3],
  [2, 4], [0, 4], [4, 4], [1, 4], [5, 4], [3, 4],
  [2, 5], [0, 5], [4, 5], [1, 5], [3, 5], [5, 5],
]

function cloneInitial(): Cell[][] {
  return INITIAL.map((row) => [...row])
}

function formatTl(value: number) {
  return `${new Intl.NumberFormat('tr-TR').format(value)} ₺`
}

const CELL_CLASS: Record<Cell, string> = {
  paid: 'bg-emerald-400 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]',
  late: 'bg-amber-400/90',
  open: 'bg-white/10',
}

export function KoopPlusDuesAnimation() {
  const [grid, setGrid] = useState<Cell[][]>(cloneInitial)
  const [step, setStep] = useState(0)
  const [lastPaid, setLastPaid] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => {
      setStep((s) => s + 1)
    }, STEP_MS)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (step === 0) return
    // Sıra bitince kısa bir bekleme, sonra çizelge baştan başlar.
    const index = step - 1
    if (index < PAY_ORDER.length) {
      const [r, c] = PAY_ORDER[index]!
      setGrid((g) => g.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? 'paid' : cell)) : row)))
      setLastPaid(`${r}-${c}`)
    } else if (index >= PAY_ORDER.length + 4) {
      setGrid(cloneInitial())
      setLastPaid(null)
      setStep(0)
    }
  }, [step])

  const total = MEMBERS.length * MONTHS.length
  const paid = grid.reduce((sum, row) => sum + row.filter((c) => c === 'paid').length, 0)
  const late = grid.reduce((sum, row) => sum + row.filter((c) => c === 'late').length, 0)
  const rate = Math.round((paid / total) * 100)
  const radius = 34
  const circumference = 2 * Math.PI * radius

  return (
    <figure className="mt-6 max-w-[640px] lg:mt-8" aria-label="KoopPlus aidat çizelgesi: ödemeler geldikçe tahsilat oranı artar">
      <div className="flex flex-col gap-4 rounded-xl border border-white/15 bg-white/[0.06] p-4 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] sm:flex-row sm:items-center sm:gap-6 sm:p-5">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-[13px] font-bold text-white sm:text-sm">Aidat çizelgesi</span>
            <span className="flex items-center gap-3 text-[11px] text-white/65">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
                Ödendi
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-400/90" />
                Gecikti
              </span>
            </span>
          </div>
          <table className="w-full border-separate border-spacing-1 text-[11px]">
            <thead>
              <tr>
                <th className="w-14 text-left font-medium text-white/50" scope="col">
                  <span className="sr-only">Üye</span>
                </th>
                {MONTHS.map((m) => (
                  <th key={m} scope="col" className="font-medium text-white/55">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((row, ri) => (
                <tr key={MEMBERS[ri]}>
                  <th scope="row" className="whitespace-nowrap pr-1 text-left font-semibold text-white/75">
                    {MEMBERS[ri]}
                  </th>
                  {row.map((cell, ci) => (
                    <td key={MONTHS[ci]} className="p-0">
                      <span
                        className={
                          'block h-5 rounded-[5px] transition-colors duration-300 sm:h-6 ' +
                          CELL_CLASS[cell] +
                          (lastPaid === `${ri}-${ci}` ? ' koop-cell-pop' : '')
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-4 border-t border-white/10 pt-4 sm:w-44 sm:flex-col sm:items-start sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <div className="relative h-[84px] w-[84px] shrink-0">
            <svg viewBox="0 0 84 84" className="h-full w-full -rotate-90" aria-hidden>
              <circle cx="42" cy="42" r={radius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
              <circle
                cx="42"
                cy="42"
                r={radius}
                fill="none"
                stroke="#34D399"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - paid / total)}
                className="transition-[stroke-dashoffset] duration-500 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-extrabold tabular-nums text-white">
              %{rate}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/55">Toplanan aidat</span>
              <span className="text-lg font-extrabold tabular-nums text-white">{formatTl(paid * DUE_TL)}</span>
            </span>
            <span className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/55">Geciken</span>
              <span className="text-sm font-bold tabular-nums text-amber-300">{late} ödeme</span>
            </span>
          </div>
        </div>
      </div>
      <figcaption className="mt-2 px-1 text-[11px] text-white/50">Örnek kayıtlarla gösterimdir.</figcaption>
    </figure>
  )
}
