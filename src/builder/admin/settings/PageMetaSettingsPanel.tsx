import { TextAreaField, TextField, ToggleField } from '@/builder/admin/ui/FormFields'
import { useBuilderStore } from '@/builder/store/builderStore'
import { getBuilderPageDefinition } from '@/builder/pages/builderPageRegistry'
import { isBhModuleBuilderPageKey } from '@/builder/types/bhModule'

/** Sayfa seviyesi SEO (+ BH katalog) — blok seçili değilken sağ panelde */
export function PageMetaSettingsPanel() {
  const seoTitle = useBuilderStore((s) => s.seoTitle)
  const seoDescription = useBuilderStore((s) => s.seoDescription)
  const pageMeta = useBuilderStore((s) => s.pageMeta)
  const updateSeo = useBuilderStore((s) => s.updateSeo)
  const updatePageMeta = useBuilderStore((s) => s.updatePageMeta)
  const pageKey = useBuilderStore((s) => s.pageKey)
  const canvasMode = useBuilderStore((s) => s.canvasMode)

  if (canvasMode !== 'builder-blocks') return null

  const def = getBuilderPageDefinition(pageKey)
  const isBh = isBhModuleBuilderPageKey(pageKey) || def?.kind === 'bh-module-detail'

  return (
    <div className="border-b border-slate-100 px-4 py-4 space-y-3">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sayfa SEO</h3>
        <p className="mt-0.5 text-[11px] text-slate-400">Document title ve meta description</p>
      </div>
      <TextField
        label="SEO Başlığı"
        value={seoTitle}
        onChange={(v) => updateSeo({ seoTitle: v })}
        hint="Boş bırakılırsa sayfa başlığı kullanılır"
      />
      <TextAreaField
        label="Meta Açıklaması"
        value={seoDescription}
        onChange={(v) => updateSeo({ seoDescription: v })}
        rows={3}
      />

      {isBh ? (
        <div className="space-y-3 border-t border-slate-100 pt-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              BH Modül Kataloğu
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Ana BH ve /moduller listesinde kullanılır
            </p>
          </div>
          <TextField
            label="Başlık"
            value={pageMeta.title}
            onChange={(title) => updatePageMeta({ title })}
          />
          <TextField
            label="Slug"
            value={pageMeta.slug}
            onChange={(slug) => updatePageMeta({ slug })}
            hint="URL: /yazilimlar/bilirkisi-hesap/moduller/:slug"
          />
          <TextAreaField
            label="Kısa açıklama"
            value={pageMeta.shortDescription}
            onChange={(shortDescription) => updatePageMeta({ shortDescription })}
            rows={2}
          />
          <TextField
            label="Kategori"
            value={pageMeta.category}
            onChange={(category) => updatePageMeta({ category })}
          />
          <TextField
            label="Kart görseli URL"
            value={pageMeta.cardImage}
            onChange={(cardImage) => updatePageMeta({ cardImage })}
          />
          <TextField
            label="İkon"
            value={pageMeta.iconName}
            onChange={(iconName) => updatePageMeta({ iconName })}
            hint="Lucide ikon adı (ör. Timer)"
          />
          <TextField
            label="Sıralama"
            value={String(pageMeta.sortOrder)}
            onChange={(v) => updatePageMeta({ sortOrder: Number(v) || 0 })}
          />
          <ToggleField
            label="Yayında"
            checked={pageMeta.published}
            onChange={(published) => updatePageMeta({ published })}
          />
          <ToggleField
            label="Ana BH ürün sayfasında göster"
            checked={pageMeta.showOnBhProductPage}
            onChange={(showOnBhProductPage) => updatePageMeta({ showOnBhProductPage })}
            hint="Hesaplama Modülleri grid’inde listelenir"
          />
        </div>
      ) : null}
    </div>
  )
}
