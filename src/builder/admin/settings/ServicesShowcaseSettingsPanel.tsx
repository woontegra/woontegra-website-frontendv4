import { SettingsAccordion } from '@/builder/admin/ui/SettingsAccordion'
import {
  ManualListPlaceholder,
  RadioCardGroup,
  SelectField,
  TextField,
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
import type { ServicesShowcaseBlock, ServicesShowcaseSource } from '@/builder/types'

const SOURCE_OPTIONS = [
  { value: 'manual', label: 'Manuel', description: 'Hizmetleri tek tek seçin' },
  { value: 'category', label: 'Kategori', description: 'Kategoriye göre filtre' },
  { value: 'featured', label: 'Öne Çıkanlar', description: 'Öne çıkan hizmetler' },
]

export function ServicesShowcaseSettingsPanel() {
  const { block, update } = useSelectedBlock<ServicesShowcaseBlock>()
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
              update({ ...block, settings: { ...settings, source: v as ServicesShowcaseSource } })
            }
            options={SOURCE_OPTIONS}
          />
          {settings.source === 'category' ? (
            <SelectField
              label="Kategori"
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
              title="Manuel hizmet listesi"
              description="Hizmet seçici API entegrasyonu ile gelecek."
            />
          ) : null}
          <TextField
            label="Limit"
            value={String(settings.limit)}
            onChange={(v) =>
              update({ ...block, settings: { ...settings, limit: Math.min(12, Math.max(1, Number(v) || 3)) } })
            }
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
