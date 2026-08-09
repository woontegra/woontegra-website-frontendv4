import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  formatLicenseDateTr,
  isMkSaasDemoConversionContext,
  isMkSaasLicenseRenewalContext,
  readMkSaasRenewalToken,
  type MkSaasLicensePurchaseView,
} from '@/lib/mkSaasLicensePurchase'
import { mkSaasLicensePurchaseService } from '@/services/mkSaasLicensePurchaseService'

type Props = {
  data: MkSaasLicensePurchaseView
  renewalDays?: number
  renewalLabel?: string | null
}

function licenseStatusLabel(data: MkSaasLicensePurchaseView): string {
  if (data.demoMu || data.lisansDurumu === 'DEMO') return 'Demo'
  if (data.lisansDurumu === 'AKTIF') return 'Aktif'
  if (data.lisansDurumu === 'SURESI_DOLDU') return 'Süresi doldu'
  return data.lisansDurumu || '—'
}

export function MkSaasLicensePurchasePanel({ data, renewalDays, renewalLabel }: Props) {
  const isRenewal = isMkSaasLicenseRenewalContext(data)
  const isDemo = isMkSaasDemoConversionContext(data) && !isRenewal
  const token = useMemo(() => readMkSaasRenewalToken(), [])

  const previewQuery = useQuery({
    queryKey: ['mk-saas-renewal-preview', token, renewalDays],
    queryFn: () =>
      mkSaasLicensePurchaseService.previewRenewal({
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

  const panelClass = isRenewal
    ? 'border-emerald-200 bg-emerald-50/90 text-emerald-950'
    : 'border-sky-200 bg-sky-50/90 text-sky-950'

  return (
    <div className={`mb-4 rounded-xl border px-4 py-4 text-sm ${panelClass}`}>
      <p className="font-semibold">
        {isRenewal
          ? 'Mevcut lisansınızı yeniliyorsunuz'
          : 'Mevcut Müvekkil Kasa hesabınız lisanslanacaktır.'}
      </p>
      {isDemo ? <p className="mt-2">Mevcut hesabınızı lisanslıyorsunuz.</p> : null}
      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-medium">Müşteri No:</dt>
          <dd>{data.musteriNo}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-medium">Büro:</dt>
          <dd>{data.buroAdi}</dd>
        </div>
        {!isRenewal ? (
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium">Mevcut lisans durumu:</dt>
            <dd>{licenseStatusLabel(data)}</dd>
          </div>
        ) : null}
        {isDemo && data.kalanGun != null ? (
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium">Kalan demo süresi:</dt>
            <dd>{data.kalanGun > 0 ? `${data.kalanGun} gün` : 'Bugün sona eriyor'}</dd>
          </div>
        ) : null}
        {isRenewal ? (
          <>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-medium">Mevcut lisans bitiş tarihi:</dt>
              <dd>{formatLicenseDateTr(data.lisansBitisTarihi)}</dd>
            </div>
            {renewalLabel ? (
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium">Seçilen yenileme:</dt>
                <dd>{renewalLabel}</dd>
              </div>
            ) : null}
            {previewQuery.data ? (
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium">Tahmini yeni bitiş:</dt>
                <dd>{formatLicenseDateTr(previewQuery.data.estimatedNewEndDate)}</dd>
              </div>
            ) : previewQuery.isFetching ? (
              <p className="text-xs opacity-80">Yeni bitiş tarihi hesaplanıyor…</p>
            ) : null}
          </>
        ) : null}
      </dl>
      <p className="mt-3 text-xs leading-relaxed opacity-90">
        Mevcut hesabınız ve verileriniz korunacaktır. Yeni hesap oluşturulmaz.
      </p>
    </div>
  )
}
