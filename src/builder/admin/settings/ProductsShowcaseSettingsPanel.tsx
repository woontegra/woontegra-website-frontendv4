import { SettingsAccordion } from '@/builder/admin/ui/SettingsAccordion'
import {
  ManualListPlaceholder,
  RadioCardGroup,
  SelectField,
  TextField,
  ToggleField,
} from '@/builder/admin/ui/FormFields'
import {
  SharedAdvancedSection,
  SharedContentSection,
  SharedDesignSection,
  SharedResponsiveSection,
  wrapSections,
} from '@/builder/admin/settings/SharedSections'
import { useSelectedBlock } from '@/builder/admin/settings/useSelectedBlock'
import { PLACEHOLDER_CATEGORIES } from '@/builder/admin/blockLibraryConfig'
import type { ProductsShowcaseBlock, ProductShowcaseSource } from '@/builder/types'

const SOURCE_OPTIONS = [
  { value: 'manual', label: 'Manuel', description: 'Ürünleri tek tek seçin' },
  { value: 'category', label: 'Kategori', description: 'Kategoriye göre filtrele' },
  { value: 'recent', label: 'Son Eklenen', description: 'En yeni ürünler' },
  { value: 'campaign', label: 'Kampanyalı', description: 'İndirimli ürünler' },
  { value: 'bestseller', label: 'En Çok Satan', description: 'Satış sıralaması' },
  { value: 'featured', label: 'Öne Çıkan', description: 'Öne çıkan ürünler' },
]

export function ProductsShowcaseSettingsPanel() {
  const { block, update } = useSelectedBlock<ProductsShowcaseBlock>()
  if (!block) return null

  const { settings } = block

  const items = wrapSections([
    {
      id: 'source',
      title: 'Kaynak',
      defaultOpen: true,
      content: (
        <>
          <RadioCardGroup
            label="Vitrin kaynağı"
            value={settings.source}
            onChange={(v) =>
              update({ ...block, settings: { ...settings, source: v as ProductShowcaseSource } })
            }
            options={SOURCE_OPTIONS}
          />
          {settings.source === 'category' ? (
            <SelectField
              label="Kategori"
              hint="API bağlantısı sonraki aşamada"
              value={settings.categoryId ?? ''}
              onChange={(categoryId) => update({ ...block, settings: { ...settings, categoryId } })}
              options={[
                { value: '', label: 'Kategori seçin…' },
                ...PLACEHOLDER_CATEGORIES.map((c) => ({ value: c.id, label: c.label })),
              ]}
            />
          ) : null}
          {settings.source === 'manual' ? (
            <ManualListPlaceholder
              title="Manuel ürün listesi"
              description="Ürün seçici Media Library / API entegrasyonu ile gelecek. Şimdilik placeholder."
            />
          ) : null}
          <TextField
            label="Limit"
            hint="Gösterilecek ürün sayısı"
            value={String(settings.limit)}
            onChange={(v) =>
              update({ ...block, settings: { ...settings, limit: Math.min(12, Math.max(1, Number(v) || 4)) } })
            }
          />
          <ToggleField
            label="Fiyat göster"
            checked={settings.showPrice !== false}
            onChange={(showPrice) => update({ ...block, settings: { ...settings, showPrice } })}
          />
          <ToggleField
            label="Sepete ekle göster"
            checked={settings.showAddToCart !== false}
            onChange={(showAddToCart) => update({ ...block, settings: { ...settings, showAddToCart } })}
          />
        </>
      ),
    },
    {
      id: 'content',
      title: 'İçerik',
      content: <SharedContentSection block={block} onChange={update} />,
    },
    {
      id: 'design',
      title: 'Tasarım',
      content: <SharedDesignSection block={block} onChange={update} />,
    },
    {
      id: 'responsive',
      title: 'Responsive',
      content: <SharedResponsiveSection block={block} onChange={update} />,
    },
    {
      id: 'advanced',
      title: 'Gelişmiş',
      content: <SharedAdvancedSection block={block} onChange={update} />,
    },
  ])

  return <SettingsAccordion items={items} />
}
