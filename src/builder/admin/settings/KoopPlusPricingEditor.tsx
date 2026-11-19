/**
 * KoopPlus adetli satış fiyatı (yönetim).
 * İlk kooperatif fiyatı = KoopPlus ürününün fiyatı (Ürünler sayfasından değişir).
 * Ek kooperatif fiyatı burada kaydedilir; satış sayfası ve ödeme hesabı buradan okur.
 */
import { useEffect, useState } from 'react'
import { koopplusPricingService } from '@/services/koopplusPricingService'
import { formatMoney } from '@/utils/formatMoney'

export function KoopPlusPricingEditor() {
  const [firstPrice, setFirstPrice] = useState<number | null>(null)
  const [additional, setAdditional] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    koopplusPricingService
      .adminGet()
      .then((d) => {
        if (!alive) return
        setFirstPrice(d.firstPrice)
        setAdditional(String(d.additionalPrice))
      })
      .catch(() => {
        if (alive) setError('Fiyat ayarı yüklenemedi.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const save = async () => {
    const n = Number(additional.replace(',', '.'))
    if (!Number.isFinite(n) || n < 0) {
      setError('Geçerli bir tutar girin.')
      return
    }
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const saved = await koopplusPricingService.adminSave(n)
      setAdditional(String(saved.additionalPrice))
      setMessage('Ek kooperatif fiyatı kaydedildi.')
    } catch {
      setError('Kaydedilemedi.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Yükleniyor…</p>

  return (
    <div className="space-y-3 text-sm">
      <div>
        <span className="block font-medium text-slate-800">İlk kooperatif fiyatı (yıllık, KDV dahil)</span>
        <span className="text-slate-600">
          {firstPrice != null ? formatMoney(firstPrice) : '—'} · Ürünler sayfasındaki KoopPlus fiyatından gelir.
        </span>
      </div>
      <label className="block">
        <span className="block font-medium text-slate-800">Ek kooperatif fiyatı (yıllık, KDV dahil, ₺)</span>
        <input
          type="number"
          min={0}
          step="1"
          value={additional}
          onChange={(e) => setAdditional(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </label>
      <p className="text-xs text-slate-500">
        Satış sayfası ve ödeme bu fiyatı kullanır. Metinlerde {'{ilkFiyat}'} ve {'{ekFiyat}'} yazarsanız güncel fiyatlarla
        değiştirilir. Bu alan sayfa yayınından bağımsız, “Kaydet” ile hemen geçerli olur.
      </p>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {message ? <p className="text-xs text-emerald-700">{message}</p> : null}
      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? 'Kaydediliyor…' : 'Kaydet'}
      </button>
    </div>
  )
}
