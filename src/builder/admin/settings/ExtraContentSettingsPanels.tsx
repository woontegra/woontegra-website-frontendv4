import { SettingsAccordion } from '@/builder/admin/ui/SettingsAccordion'
import {
  AddItemButton,
  ImageUrlField,
  SelectField,
  TextField,
} from '@/builder/admin/ui/FormFields'
import { RichTextHtmlEditor } from '@/builder/admin/ui/RichTextHtmlEditor'
import {
  SharedAdvancedSection,
  SharedContentSection,
  SharedDesignSection,
  SharedResponsiveSection,
  wrapSections,
} from '@/builder/admin/settings/SharedSections'
import { useSelectedBlock } from '@/builder/admin/settings/useSelectedBlock'
import type { CalloutBlock, GalleryBlock, VideoEmbedBlock } from '@/builder/types/contentBlocks'

export function VideoEmbedSettingsPanel() {
  const { block, update } = useSelectedBlock<VideoEmbedBlock>()
  if (!block) return null

  const items = wrapSections([
    {
      id: 'content',
      title: 'İçerik',
      defaultOpen: true,
      content: (
        <>
          <SharedContentSection block={block} onChange={update} />
          <TextField
            label="YouTube URL"
            hint="watch, youtu.be veya embed bağlantısı"
            value={block.settings.youtubeUrl ?? ''}
            onChange={(youtubeUrl) =>
              update({ ...block, settings: { ...block.settings, youtubeUrl } })
            }
          />
          <TextField
            label="Altyazı (opsiyonel)"
            value={block.settings.caption ?? ''}
            onChange={(caption) => update({ ...block, settings: { ...block.settings, caption } })}
          />
        </>
      ),
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

export function CalloutSettingsPanel() {
  const { block, update } = useSelectedBlock<CalloutBlock>()
  if (!block) return null

  const items = wrapSections([
    {
      id: 'content',
      title: 'İçerik',
      defaultOpen: true,
      content: (
        <>
          <SharedContentSection block={block} onChange={update} />
          <SelectField
            label="Tür"
            value={block.settings.tone || 'info'}
            onChange={(tone) =>
              update({
                ...block,
                settings: { ...block.settings, tone: tone as CalloutBlock['settings']['tone'] },
              })
            }
            options={[
              { value: 'info', label: 'Bilgi' },
              { value: 'warning', label: 'Uyarı' },
              { value: 'note', label: 'Not' },
            ]}
          />
          <RichTextHtmlEditor
            label="Açıklama"
            value={block.settings.body ?? ''}
            onChange={(body) => update({ ...block, settings: { ...block.settings, body } })}
          />
        </>
      ),
    },
    {
      id: 'design',
      title: 'Tasarım',
      content: <SharedDesignSection block={block} onChange={update} />,
    },
    {
      id: 'advanced',
      title: 'Gelişmiş',
      content: <SharedAdvancedSection block={block} onChange={update} />,
    },
  ])

  return <SettingsAccordion items={items} />
}

export function GallerySettingsPanel() {
  const { block, update } = useSelectedBlock<GalleryBlock>()
  if (!block) return null

  const images = block.settings.images ?? []

  const items = wrapSections([
    {
      id: 'content',
      title: 'İçerik',
      defaultOpen: true,
      content: (
        <>
          <SharedContentSection block={block} onChange={update} />
          <SelectField
            label="Sütun sayısı"
            value={String(block.settings.columns || 3)}
            onChange={(v) =>
              update({
                ...block,
                settings: { ...block.settings, columns: Number(v) as 2 | 3 | 4 },
              })
            }
            options={[
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4', label: '4' },
            ]}
          />
          <div className="space-y-3">
            {images.map((img, index) => (
              <div key={img.id} className="rounded-lg border border-slate-200 p-3 space-y-2">
                <ImageUrlField
                  label={`Görsel ${index + 1}`}
                  value={img.url}
                  onChange={(url) => {
                    const next = images.map((row) => (row.id === img.id ? { ...row, url } : row))
                    update({ ...block, settings: { ...block.settings, images: next } })
                  }}
                  uploadFolder="builder"
                />
                <TextField
                  label="Alt metin"
                  value={img.alt ?? ''}
                  onChange={(alt) => {
                    const next = images.map((row) => (row.id === img.id ? { ...row, alt } : row))
                    update({ ...block, settings: { ...block.settings, images: next } })
                  }}
                />
                <button
                  type="button"
                  className="text-xs font-medium text-rose-600 hover:underline"
                  onClick={() => {
                    update({
                      ...block,
                      settings: {
                        ...block.settings,
                        images: images.filter((row) => row.id !== img.id),
                      },
                    })
                  }}
                >
                  Kaldır
                </button>
              </div>
            ))}
            <AddItemButton
              onClick={() =>
                update({
                  ...block,
                  settings: {
                    ...block.settings,
                    images: [
                      ...images,
                      {
                        id: `img-${Date.now()}`,
                        url: '',
                        alt: '',
                      },
                    ],
                  },
                })
              }
            >
              Görsel ekle
            </AddItemButton>
          </div>
        </>
      ),
    },
    {
      id: 'design',
      title: 'Tasarım',
      content: <SharedDesignSection block={block} onChange={update} />,
    },
    {
      id: 'advanced',
      title: 'Gelişmiş',
      content: <SharedAdvancedSection block={block} onChange={update} />,
    },
  ])

  return <SettingsAccordion items={items} />
}
