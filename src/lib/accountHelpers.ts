import type { CustomerOrderDetail, CustomerOrderItem, CustomerOrderListItem } from '@/types/customerOrders'

export function formatAccountDate(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

export function orderStatusTone(status: string): 'success' | 'warning' | 'danger' | 'default' {
  const s = status.toUpperCase()
  if (s === 'PAID' || s === 'PROCESSING') return 'success'
  if (s === 'PENDING') return 'warning'
  if (s === 'FAILED' || s === 'CANCELLED') return 'danger'
  return 'default'
}

export function orderStatusLabel(status: string): string {
  switch (status.toUpperCase()) {
    case 'PAID':
      return 'Ödendi'
    case 'PROCESSING':
      return 'İşleniyor'
    case 'PENDING':
      return 'Beklemede'
    case 'FAILED':
      return 'Başarısız'
    case 'CANCELLED':
      return 'İptal'
    default:
      return status
  }
}

export function isPaidLikeOrder(status: string): boolean {
  const s = status.toUpperCase()
  return s === 'PAID' || s === 'PROCESSING'
}

export function isSaasOrderDeliveryUrl(url: string | null | undefined): boolean {
  return typeof url === 'string' && url.startsWith('saas:')
}

export function resolveDownloadHref(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return url
  return `/api/downloads/order/${encodeURIComponent(url)}`
}

export type DownloadKind = 'setup' | 'portable' | 'generic'

export function inferDownloadKind(url: string): DownloadKind {
  const lower = url.toLowerCase()
  if (/portable/.test(lower)) return 'portable'
  if (/setup|install|kurulum|\.exe|\.msi/.test(lower)) return 'setup'
  return 'generic'
}

function resolveItemDownloadMeta(item: CustomerOrderItem): {
  kind: DownloadKind
  label: string
  buttonLabel: string
} {
  if (item.downloadKind && item.downloadLabel && item.downloadButtonLabel) {
    return {
      kind: item.downloadKind,
      label: item.downloadLabel,
      buttonLabel: item.downloadButtonLabel,
    }
  }
  const kind = item.downloadUrl ? inferDownloadKind(item.downloadUrl) : 'generic'
  if (kind === 'portable') {
    return { kind, label: 'Portable dosya', buttonLabel: 'Portable indir' }
  }
  if (kind === 'setup') {
    return { kind, label: 'Kurulum dosyası', buttonLabel: 'Kurulum dosyasını indir' }
  }
  return { kind, label: 'Dijital dosya', buttonLabel: 'İndir' }
}

export type AggregatedDownload = {
  orderNo: string
  productName: string
  productSlug: string | null
  downloadUrl: string
  kind: DownloadKind
  label: string
  buttonLabel: string
  createdAt: string
}

export type AggregatedLicense = {
  orderNo: string
  licenseKeyMasked: string
  productName: string
  createdAt: string
}

export function aggregateDownloadsFromOrders(
  orders: CustomerOrderListItem[],
  details: CustomerOrderDetail[],
): AggregatedDownload[] {
  const paid = new Set(orders.filter((o) => isPaidLikeOrder(o.status)).map((o) => o.orderNo))
  const rows: AggregatedDownload[] = []
  for (const detail of details) {
    if (!paid.has(detail.orderNo)) continue
    for (const item of detail.items) {
      if (!item.downloadUrl || isSaasOrderDeliveryUrl(item.downloadUrl)) continue
      const meta = resolveItemDownloadMeta(item)
      rows.push({
        orderNo: detail.orderNo,
        productName: item.productName,
        productSlug: item.productSlug,
        downloadUrl: resolveDownloadHref(item.downloadUrl),
        kind: meta.kind,
        label: meta.label,
        buttonLabel: meta.buttonLabel,
        createdAt: detail.createdAt,
      })
    }
  }
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function aggregateLicensesFromOrders(
  orders: CustomerOrderListItem[],
  details: CustomerOrderDetail[],
): AggregatedLicense[] {
  const paid = new Set(orders.filter((o) => isPaidLikeOrder(o.status)).map((o) => o.orderNo))
  const rows: AggregatedLicense[] = []
  for (const detail of details) {
    if (!paid.has(detail.orderNo)) continue
    if (!detail.licenseCodesMasked?.length) continue
    const productName = detail.items[0]?.productName ?? detail.orderNo
    for (const key of detail.licenseCodesMasked) {
      rows.push({
        orderNo: detail.orderNo,
        licenseKeyMasked: key,
        productName,
        createdAt: detail.createdAt,
      })
    }
  }
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function countPendingPayments(orders: CustomerOrderListItem[]): number {
  return orders.filter((o) => o.status.toUpperCase() === 'PENDING').length
}

/** Dashboard özeti: ödeme onaylı siparişlerde indirilebilir ürün satırı sayısı (N+1 detay çağrısı gerektirmez). */
export function countPaidDownloadLineItems(orders: CustomerOrderListItem[]): number {
  let count = 0
  for (const order of orders) {
    if (!isPaidLikeOrder(order.status)) continue
    const types = order.lineProductTypes ?? []
    count += types.filter((t) => t === 'DOWNLOAD').length
  }
  return count
}

export function pickLatestOrder(orders: CustomerOrderListItem[]): CustomerOrderListItem | null {
  if (!orders.length) return null
  return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
}

export function downloadButtonsForItem(item: CustomerOrderItem, paid: boolean) {
  if (!paid || !item.downloadUrl || isSaasOrderDeliveryUrl(item.downloadUrl)) return []
  const href = resolveDownloadHref(item.downloadUrl)
  const meta = resolveItemDownloadMeta(item)
  return [{ label: meta.buttonLabel, href }]
}
