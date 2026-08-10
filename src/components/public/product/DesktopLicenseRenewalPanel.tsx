import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  formatLicenseDateTr,
  isDesktopLicenseRenewalContext,
  readDesktopRenewalToken,
  type DesktopLicenseRenewalView,
} from '@/lib/desktopLicenseRenewal'
import { desktopLicenseRenewalService } from '@/services/desktopLicenseRenewalService'

type Props = {
  data: DesktopLicenseRenewalView
  renewalDays?: number
  renewalLabel?: string | null
}

export function DesktopLicenseRenewalPanel({ data, renewalDays, renewalLabel }: Props) {
  const isRenewal = isDesktopLicenseRenewalContext(data)
  const token = useMemo(() => readDesktopRenewalToken(), [])

  const previewQuery = useQuery({
    queryKey: ['desktop-renewal-preview', token, renewalDays],
    queryFn: () =>
      desktopLicenseRenewalService.previewRenewal({
        renewalToken: token!,
        renewalDays: renewalDays!,
      }),
    enabled: Boolean(isRenewal && token && renewalDays && renewalDays > 0),
    staleTime: 30_000,
  })

  useEffect(() => {
    if (isRenewal && renewalDays && renewalDays > 0) {
      void previewQuery.refetch()
    }
  }, [isRenewal, renewalDays, previewQuery])

  return (
    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-4 text-sm text-emerald-950">
      <p className="font-semibold">Mevcut Müvekkil Kasa Defteri lisansınızı yeniliyorsunuz</p>
      <dl className="mt-3 space-y-1.5 text-sm">
        {data.customerName ? (
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium">Müşteri:</dt>
            <dd>{data.customerName}</dd>
          </div>
        ) : null}
        {data.customerNumber ? (
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium">Müşteri No:</dt>
            <dd>{data.customerNumber}</dd>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-medium">Lisans No:</dt>
          <dd>{data.licenseKeyMasked}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-medium">Mevcut lisans bitiş tarihi:</dt>
          <dd>{formatLicenseDateTr(data.licenseExpiresAt)}</dd>
        </div>
        {renewalLabel ? (
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium">Seçilen yenileme süresi:</dt>
            <dd>{renewalLabel}</dd>
          </div>
        ) : null}
        {previewQuery.data ? (
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium">Tahmini yeni bitiş tarihi:</dt>
            <dd>{formatLicenseDateTr(previewQuery.data.estimatedNewEndDate)}</dd>
          </div>
        ) : previewQuery.isFetching ? (
          <p className="text-xs opacity-80">Yeni bitiş tarihi hesaplanıyor…</p>
        ) : null}
      </dl>
      <p className="mt-3 text-xs leading-relaxed opacity-90">
        Mevcut lisansınız korunacaktır. Yeni lisans oluşturulmaz.
      </p>
    </div>
  )
}
