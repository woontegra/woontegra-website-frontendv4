import { useSelectedBlock } from '@/builder/admin/settings/useSelectedBlock'
import type { LegacySectionBlock } from '@/builder/types/legacySection'

export function LegacySectionSettingsPanel() {
  const { block } = useSelectedBlock<LegacySectionBlock>()
  if (!block) return null

  const { sectionKey, title, source, locked } = block.settings

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-sm font-semibold text-slate-900">Kilitli legacy bölüm</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          Bu bölüm henüz düzenlenebilir builder bloğuna çevrilmedi. Public sitedeki gerçek component ile
          render ediliyor; görünüm korunuyor.
        </p>
      </div>

      <dl className="space-y-2 text-xs">
        <div>
          <dt className="font-medium text-slate-500">Bölüm</dt>
          <dd className="text-slate-900">{title}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Anahtar</dt>
          <dd className="font-mono text-slate-800">{sectionKey}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Kaynak</dt>
          <dd className="text-slate-800">{source}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Durum</dt>
          <dd className="text-amber-800">{locked ? 'Kilitli — ileride dönüştürülecek' : 'Açık'}</dd>
        </div>
      </dl>

      <p className="text-[11px] leading-relaxed text-slate-400">
        İleride bu bölüm tipi için özel builder bloğu eklendiğinde &quot;Düzenlenebilir bloğa
        çevir&quot; seçeneği sunulacak.
      </p>
    </div>
  )
}
