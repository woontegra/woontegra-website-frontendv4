import { listBlockDefinitions } from '@/builder/registry/blockRegistry'
import { createDefaultHeroBlock } from '@/builder/types'
import { PageBlocksRenderer } from '@/builder/render/PageBlocksRenderer'

export function AdminBuilderPreviewPage() {
  const definitions = listBlockDefinitions()
  const previewBlock = createDefaultHeroBlock('preview-hero')
  previewBlock.title = 'Builder Önizleme'
  previewBlock.description = 'Sol: blok kütüphanesi · Orta: önizleme · Sağ: ayar paneli (Aşama 4)'
  previewBlock.settings.mode = 'gradient'
  previewBlock.settings.gradient = 'linear-gradient(135deg, #1e293b, #065f46)'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visual Page Builder</h1>
        <p className="mt-1 text-sm text-slate-600">
          Esnek blok mimarisi — her alan opsiyonel, sabit component yok.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Blok kütüphanesi</h2>
          <ul className="mt-3 space-y-2">
            {definitions.map((d) => (
              <li key={d.type} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <p className="font-medium text-slate-800">{d.label}</p>
                <p className="text-xs text-slate-500">{d.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-1">
          <p className="border-b border-slate-100 px-4 py-2 text-xs font-medium text-slate-500">Önizleme</p>
          <PageBlocksRenderer blocks={[previewBlock]} mode="preview" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Ayar paneli</h2>
          <p className="mt-2 text-sm text-slate-600">
            Hero: mode, slides, visibility, overlay, responsive height, carousel ayarları — Aşama 4&apos;te
            form bileşenleri eklenecek.
          </p>
        </div>
      </div>
    </div>
  )
}
