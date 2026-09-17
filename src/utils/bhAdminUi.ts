import { formatMoney } from '@/utils/formatMoney'

/** Display helpers for Bilirkişi Hesap admin UI (labels only — no business logic). */

export function formatBhKurus(kurus: number | null | undefined): string {
  if (kurus == null || Number.isNaN(Number(kurus))) return '—'
  return formatMoney(Number(kurus) / 100, 'TRY')
}

/** Amount may already be TL float (legacy amount) or kuruş — prefer *Kurus fields. */
export function formatBhPaidAmount(row: {
  finalPriceKurus?: number | null
  amount?: number | null
}): string {
  if (row.finalPriceKurus != null) return formatBhKurus(row.finalPriceKurus)
  if (row.amount != null) {
    // BH Payment.amount is kuruş in schema
    return formatBhKurus(row.amount)
  }
  return '—'
}

export function shortOrderRef(ref: string | null | undefined, head = 10, tail = 6): string {
  const s = String(ref || '').trim()
  if (!s) return '—'
  if (s.length <= head + tail + 1) return s
  return `${s.slice(0, head)}…${s.slice(-tail)}`
}

/**
 * Package label from BH Payment fields.
 * productType is source of truth: monthly | annual | starter.
 * subscriptionPeriod (1|2|3) only applies to annual multi-year plans.
 */
export function bhPackageLabel(input: {
  productType?: string | null
  subscriptionPeriod?: number | string | null
  planName?: string | null
  billingCycle?: string | null
}): string {
  const type = String(input.productType || '').toLowerCase().trim()
  if (type === 'monthly') return 'Aylık'
  if (type === 'starter') return 'Başlangıç'
  if (type === 'annual') {
    const period = Number(input.subscriptionPeriod)
    if (period === 2) return '2 Yıllık'
    if (period === 3) return '3 Yıllık'
    return 'Yıllık'
  }

  const cycle = String(input.billingCycle || '').toUpperCase()
  if (cycle === 'MONTHLY') return 'Aylık'
  if (cycle === 'YEARLY') return 'Yıllık'

  const plan = String(input.planName || '').trim()
  if (plan) return plan
  return '—'
}

export function bhPaymentMethodLabel(method: string | null | undefined): string {
  const m = String(method || '').toUpperCase()
  if (m === 'PAYTR') return 'Kart (PayTR)'
  if (m === 'BANK_TRANSFER') return 'Havale / EFT'
  return method || '—'
}

export type BhStatusMeta = { label: string; tone: 'default' | 'success' | 'warning' | 'danger' }

export function bhPaymentStatusMeta(status: string | null | undefined): BhStatusMeta {
  switch (String(status || '')) {
    case 'success':
      return { label: 'Ödendi', tone: 'success' }
    case 'pending':
      return { label: 'Beklemede', tone: 'warning' }
    case 'failed':
      return { label: 'Başarısız', tone: 'danger' }
    case 'bank_transfer_pending':
      return { label: 'Havale Onayı Bekliyor', tone: 'warning' }
    case 'bank_transfer_rejected':
      return { label: 'Havale Reddedildi', tone: 'danger' }
    default:
      return { label: status || '—', tone: 'default' }
  }
}

export function bhBankTransferStatusMeta(status: string | null | undefined): BhStatusMeta {
  switch (String(status || '')) {
    case 'bank_transfer_pending':
      return { label: 'Onay Bekliyor', tone: 'warning' }
    case 'success':
      return { label: 'Onaylandı', tone: 'success' }
    case 'bank_transfer_rejected':
      return { label: 'Reddedildi', tone: 'danger' }
    default:
      return bhPaymentStatusMeta(status)
  }
}

export function bhLegalStatusMeta(status: string | null | undefined): BhStatusMeta {
  switch (String(status || '')) {
    case 'COMPLETED':
      return { label: 'Tamamlandı', tone: 'success' }
    case 'PENDING_PAYMENT':
      return { label: 'Ödeme Bekliyor', tone: 'warning' }
    case 'CANCELLED':
      return { label: 'İptal', tone: 'default' }
    case 'FAILED':
    case 'FAILED_ARCHIVE':
      return { label: 'Başarısız', tone: 'danger' }
    default:
      return { label: status || '—', tone: 'default' }
  }
}

export function bhFulfillmentLabel(status: string | null | undefined): string {
  switch (String(status || '').toUpperCase()) {
    case 'PENDING':
      return 'Bekliyor'
    case 'APPLIED':
    case 'FULFILLED':
    case 'SUCCESS':
    case 'DONE':
      return 'Lisans uygulandı'
    case 'FAILED':
      return 'Başarısız'
    case 'PROCESSING':
    case 'IN_PROGRESS':
      return 'İşleniyor'
    default:
      return status || '—'
  }
}

export function bhInvoiceTypeLabel(type: string | null | undefined): string {
  const t = String(type || '').toLowerCase()
  if (t === 'corporate') return 'Kurumsal'
  if (t === 'individual') return 'Bireysel'
  return type || '—'
}

export function bhDocumentTypeLabel(type: string | null | undefined, title?: string | null): string {
  if (title && String(title).trim()) return String(title).trim()
  switch (String(type || '')) {
    case 'PRE_INFORMATION':
      return 'Ön Bilgilendirme Formu'
    case 'DISTANCE_SALE':
      return 'Mesafeli Satış Sözleşmesi'
    case 'SUBSCRIPTION_AGREEMENT':
      return 'Abonelik Sözleşmesi'
    case 'KVKK':
      return 'KVKK Aydınlatma Metni'
    case 'WITHDRAWAL_EXCEPTION':
      return 'Cayma Hakkı İstisnası'
    case 'ELECTRONIC_CERTIFICATE':
      return 'Elektronik Onay Sertifikası'
    default:
      return type || 'Belge'
  }
}

export function formatBhDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('tr-TR')
}
