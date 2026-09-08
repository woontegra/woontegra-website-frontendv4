import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { affSales, formatAffiliateDateTime, formatAffiliateTry } from '@/lib/affiliateMoney'
import {
  affiliateCommissionStatusLabel,
  affiliatePackageDisplayName,
  affiliateSaleTypeLabel,
} from '@/lib/affiliateUiLabels'
import type { AffiliateCommissionRow } from '@/types/affiliatePartner'
import { cn } from '@/lib/cn'

function remainingKurus(row: AffiliateCommissionRow): number {
  return (
    row.remainingAmountKurus ??
    Math.max(0, row.commissionAmountKurus - (row.paidAmountKurus ?? 0))
  )
}

function MobileField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 text-[12px]">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className={cn('min-w-0 text-right text-slate-800', mono && 'tabular-nums')}>{value}</span>
    </div>
  )
}

/**
 * Satış/komisyon listesi: masaüstü tablo (kaydırmasız, %100), mobil etiket-değer kartları.
 */
export function AffiliateCommissionSalesView({
  items,
  variant,
}: {
  items: AffiliateCommissionRow[]
  variant: 'partner' | 'admin'
}) {
  return (
    <>
      {/* Mobil: kartlar */}
      <div className="space-y-2 md:hidden">
        {items.map((row) => (
          <div
            key={row.id}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 space-y-1.5"
          >
            <MobileField label="Tarih" value={formatAffiliateDateTime(row.createdAt)} mono />
            <MobileField
              label="Paket"
              value={affiliatePackageDisplayName(row.productName, row.productType)}
            />
            <MobileField label="Satış türü" value={affiliateSaleTypeLabel(row.saleType)} />
            {variant === 'admin' ? (
              <MobileField
                label="İndirim"
                value={`%${row.effectiveCustomerDiscountRateSnapshot ?? 0}`}
                mono
              />
            ) : null}
            <MobileField label="Tahsilat" value={formatAffiliateTry(row.grossPaidAmountKurus)} mono />
            <MobileField
              label="Matrah"
              value={formatAffiliateTry(row.commissionBaseAmountKurus ?? 0)}
              mono
            />
            <MobileField label="Oran" value={`%${row.commissionRateSnapshot}`} mono />
            <MobileField label="Komisyon" value={formatAffiliateTry(row.commissionAmountKurus)} mono />
            <MobileField label="Ödenen" value={formatAffiliateTry(row.paidAmountKurus ?? 0)} mono />
            <MobileField label="Kalan" value={formatAffiliateTry(remainingKurus(row))} mono />
            <MobileField label="Durum" value={affiliateCommissionStatusLabel(row.status)} />
          </div>
        ))}
      </div>

      {/* Masaüstü: kartı dolduran tablo, yatay kaydırma yok */}
      <Table
        className="hidden overflow-x-visible md:block"
        tableClassName={cn(
          'w-full table-fixed text-[11px] leading-snug',
          variant === 'admin' ? affSales.adminTable : affSales.partnerTable,
        )}
      >
        {variant === 'partner' ? (
          <colgroup>
            <col className="w-[12%]" />
            <col className="w-[18%]" />
            <col className="w-[9%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[5%]" />
            <col className="w-[10%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[10%]" />
          </colgroup>
        ) : (
          <colgroup>
            <col className="w-[11%]" />
            <col className="w-[8%]" />
            <col className="w-[15%]" />
            <col className="w-[5%]" />
            <col className="w-[9%]" />
            <col className="w-[9%]" />
            <col className="w-[4%]" />
            <col className="w-[9%]" />
            <col className="w-[7%]" />
            <col className="w-[7%]" />
            <col className="w-[16%]" />
          </colgroup>
        )}
        <THead>
          <TR>
            <TH className={affSales.th}>Tarih</TH>
            {variant === 'admin' ? <TH className={affSales.th}>Satış tipi</TH> : null}
            <TH className={affSales.th}>Paket</TH>
            {variant === 'partner' ? <TH className={affSales.th}>Satış türü</TH> : null}
            {variant === 'admin' ? <TH className={`${affSales.th} text-right`}>İndirim</TH> : null}
            <TH className={`${affSales.th} text-right`}>Tahsilat</TH>
            <TH className={`${affSales.th} text-right`}>Matrah</TH>
            <TH className={`${affSales.th} text-right`}>Oran</TH>
            <TH className={`${affSales.th} text-right`}>Komisyon</TH>
            <TH className={`${affSales.th} text-right`}>Ödenen</TH>
            <TH className={`${affSales.th} text-right`}>Kalan</TH>
            <TH className={affSales.th}>Durum</TH>
          </TR>
        </THead>
        <TBody>
          {items.map((row) => (
            <TR key={row.id}>
              <TD className={`${affSales.td} ${affSales.nowrap} tabular-nums`}>
                {formatAffiliateDateTime(row.createdAt)}
              </TD>
              {variant === 'admin' ? (
                <TD className={`${affSales.td} ${affSales.nowrap}`}>
                  {affiliateSaleTypeLabel(row.saleType)}
                </TD>
              ) : null}
              <TD className={`${affSales.td} ${affSales.package}`}>
                {affiliatePackageDisplayName(row.productName, row.productType)}
              </TD>
              {variant === 'partner' ? (
                <TD className={`${affSales.td} ${affSales.nowrap}`}>
                  {affiliateSaleTypeLabel(row.saleType)}
                </TD>
              ) : null}
              {variant === 'admin' ? (
                <TD className={`${affSales.td} ${affSales.nowrap} text-right tabular-nums`}>
                  %{row.effectiveCustomerDiscountRateSnapshot ?? 0}
                </TD>
              ) : null}
              <TD className={`${affSales.td} ${affSales.money}`}>
                {formatAffiliateTry(row.grossPaidAmountKurus)}
              </TD>
              <TD className={`${affSales.td} ${affSales.money}`}>
                {formatAffiliateTry(row.commissionBaseAmountKurus ?? 0)}
              </TD>
              <TD className={`${affSales.td} ${affSales.nowrap} text-right tabular-nums`}>
                %{row.commissionRateSnapshot}
              </TD>
              <TD className={`${affSales.td} ${affSales.money}`}>
                {formatAffiliateTry(row.commissionAmountKurus)}
              </TD>
              <TD className={`${affSales.td} ${affSales.money}`}>
                {formatAffiliateTry(row.paidAmountKurus ?? 0)}
              </TD>
              <TD className={`${affSales.td} ${affSales.money}`}>
                {formatAffiliateTry(remainingKurus(row))}
              </TD>
              <TD className={`${affSales.td} ${affSales.nowrap}`}>
                {affiliateCommissionStatusLabel(row.status)}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </>
  )
}
