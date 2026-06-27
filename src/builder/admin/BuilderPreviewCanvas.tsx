import { PublicSitePageEmbed } from '@/builder/preview/PublicSitePageEmbed'
import { BuilderEditableBlocksCanvas } from '@/builder/preview/BuilderEditableBlocksCanvas'
import { useBuilderStore } from '@/builder/store/builderStore'
import { cn } from '@/lib/cn'
import type { ConversionReport } from '@/builder/load/conversionReport'

export function BuilderPreviewCanvas() {
  const pageKey = useBuilderStore((s) => s.pageKey)
  const pageTitle = useBuilderStore((s) => s.pageTitle)
  const canvasMode = useBuilderStore((s) => s.canvasMode)
  const loadPageStatus = useBuilderStore((s) => s.loadPageStatus)
  const loadPageError = useBuilderStore((s) => s.loadPageError)
  const blocks = useBuilderStore((s) => s.blocks)
  const conversionReport = useBuilderStore((s) => s.conversionReport)
  const convertToBuilderDraft = useBuilderStore((s) => s.convertToBuilderDraft)
  const revertToLegacyView = useBuilderStore((s) => s.revertToLegacyView)

  const isEditable = canvasMode === 'builder-blocks'
  const isLegacy = canvasMode === 'legacy-public'

  return (
    <main className="min-h-[50vh] min-w-0 flex-1 overflow-y-auto bg-[#eef1f6]">
      <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 px-4 py-2 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-slate-700">{pageTitle}</p>
            {loadPageError ? (
              <p className="text-[10px] text-amber-600">API: {loadPageError}</p>
            ) : isEditable ? (
              <p className="text-[10px] text-emerald-700">
                Düzenleme modu — public componentler korunarak blok yapısı oluşturuldu
              </p>
            ) : (
              <p className="text-[10px] text-slate-500">Salt okunur önizleme — public site birebir</p>
            )}
          </div>
          <ModeBadge editable={isEditable} blockCount={blocks.length} />
        </div>
      </div>

      {isLegacy ? <LegacyReadOnlyBanner onConvert={convertToBuilderDraft} /> : null}

      {isEditable && conversionReport ? (
        <ConversionReportBanner report={conversionReport} onRevert={revertToLegacyView} />
      ) : null}

      {isEditable && !conversionReport ? (
        <div className="border-b border-slate-200 bg-white px-4 py-2">
          <button
            type="button"
            onClick={revertToLegacyView}
            className="text-xs font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            Legacy görünüme dön
          </button>
        </div>
      ) : null}

      {loadPageStatus === 'loading' ? (
        <div className="space-y-3 bg-white p-6">
          <div className="h-40 animate-pulse bg-slate-100" />
          <div className="h-24 animate-pulse bg-slate-100" />
          <p className="text-center text-xs text-slate-400">Sayfa yükleniyor…</p>
        </div>
      ) : isEditable ? (
        <div className="bg-white shadow-sm">
          <BuilderEditableBlocksCanvas />
        </div>
      ) : (
        <div className="bg-white shadow-sm">
          <PublicSitePageEmbed pageKey={pageKey} />
        </div>
      )}
    </main>
  )
}

function ModeBadge({ editable, blockCount }: { editable: boolean; blockCount: number }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        editable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600',
      )}
    >
      {editable ? `Düzenlenebilir · ${blockCount} blok` : 'Legacy · salt okunur'}
    </span>
  )
}

function LegacyReadOnlyBanner({ onConvert }: { onConvert: () => void }) {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-amber-950">
            Bu sayfa henüz builder formatına dönüştürülmemiş
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
            Dönüştürme mevcut public görünümü referans alır; birebir eşleşmeyen bölümler legacy-section
            olarak korunur.
          </p>
        </div>
        <button
          type="button"
          onClick={onConvert}
          className="shrink-0 rounded-lg bg-amber-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-950"
        >
          Builder&apos;a dönüştür
        </button>
      </div>
    </div>
  )
}

function ConversionReportBanner({
  report,
  onRevert,
}: {
  report: ConversionReport
  onRevert: () => void
}) {
  return (
    <div className="border-b border-blue-200 bg-blue-50 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 text-xs text-blue-950">
          <p className="font-semibold">Dönüştürme özeti</p>
          <p className="mt-1">
            {report.convertedCount} builder blok · {report.legacyCount} legacy-section korundu
          </p>
          <ul className="mt-2 max-h-24 space-y-0.5 overflow-y-auto text-[11px] text-blue-900/90">
            {report.sections.map((s) => (
              <li key={s.key}>
                {s.title} → {s.mode === 'legacy-section' ? 'legacy (görünüm korundu)' : 'builder blok'}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={onRevert}
          className="shrink-0 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-900 transition hover:bg-blue-100"
        >
          Legacy görünüme dön
        </button>
      </div>
    </div>
  )
}
