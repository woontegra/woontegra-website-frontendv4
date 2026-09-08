/**
 * Affiliate ekranları — yalnızca sunum etiketleri.
 * API / DB enum değerlerini değiştirmez.
 */

export function affiliateSaleTypeLabel(saleType: string | null | undefined): string {
  const s = String(saleType ?? '').trim()
  if (s === 'FIRST_SALE') return 'İlk Satış'
  if (s === 'RENEWAL') return 'Yenileme'
  return s || '—'
}

export function affiliateCommissionStatusLabel(status: string | null | undefined): string {
  const s = String(status ?? '').trim()
  if (s === 'EARNED') return 'Hak Edildi'
  if (s === 'PARTIALLY_PAID') return 'Kısmen Ödendi'
  if (s === 'PAID') return 'Ödendi'
  if (s === 'REVERSED' || s === 'CANCELLED' || s === 'CANCELED') return 'İptal Edildi'
  return s || '—'
}

export function affiliatePayoutStatusLabel(status: string | null | undefined): string {
  const s = String(status ?? '').trim()
  if (s === 'PAID') return 'Ödendi'
  if (s === 'PENDING') return 'Beklemede'
  if (s === 'FAILED') return 'Başarısız'
  if (s === 'REVERSED' || s === 'CANCELLED' || s === 'CANCELED') return 'İptal Edildi'
  return s || '—'
}

export function affiliatePaymentMethodLabel(method: string | null | undefined): string {
  const m = String(method ?? '').trim().toUpperCase()
  if (m === 'BANK_TRANSFER' || m === 'HAVALE' || m === 'EFT') return 'Banka havalesi'
  if (m === 'CASH') return 'Nakit'
  if (m === 'OTHER') return 'Diğer'
  if (m === 'PAYTR' || m === 'CARD' || m === 'CREDIT_CARD') return 'Kart'
  return String(method ?? '').trim() || '—'
}

/** productType fallback (ürün adı yoksa); DOWNLOAD/SAAS gibi kodları Türkçeleştir. */
export function affiliateProductTypeLabel(productType: string | null | undefined): string {
  const t = String(productType ?? '').trim().toUpperCase()
  if (t === 'DOWNLOAD' || t === 'DESKTOP') return 'Masaüstü'
  if (t === 'SAAS' || t === 'SUBSCRIPTION') return 'SaaS'
  if (t === 'ANNUAL' || t === 'YEARLY') return 'Yıllık'
  if (t === 'MONTHLY') return 'Aylık'
  return String(productType ?? '').trim() || '—'
}

export function affiliatePackageDisplayName(
  productName: string | null | undefined,
  productType: string | null | undefined,
): string {
  const name = String(productName ?? '').trim()
  if (name) return name
  return affiliateProductTypeLabel(productType)
}
