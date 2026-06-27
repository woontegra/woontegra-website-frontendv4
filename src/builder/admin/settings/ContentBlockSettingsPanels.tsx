import { useState } from 'react'
import { SettingsAccordion, CollapsibleItem } from '@/builder/admin/ui/SettingsAccordion'
import { AddItemButton, ImageUrlField, SelectField, TextAreaField, TextField, ToggleField } from '@/builder/admin/ui/FormFields'
import {
  SharedAdvancedSection,
  SharedContentSection,
  SharedDesignSection,
  SharedResponsiveSection,
  wrapSections,
} from '@/builder/admin/settings/SharedSections'
import { useSelectedBlock } from '@/builder/admin/settings/useSelectedBlock'
import { useFocusCollapsible } from '@/builder/admin/settings/useFocusCollapsible'
import type { CardGridItem, ImageTextBlock, RichTextBlock } from '@/builder/types'

export function RichTextSettingsPanel() {
  const { block, update } = useSelectedBlock<RichTextBlock>()
  const [openCardId, setOpenCardId] = useState<string | null>(null)
  useFocusCollapsible(setOpenCardId)
  if (!block) return null

  const variant = block.settings.variant ?? 'default'
  const isAboutVariant = variant.startsWith('about')

  const updateParagraph = (index: number, value: string) => {
    const paragraphs = [...(block.settings.paragraphs ?? [])]
    paragraphs[index] = value
    update({ ...block, settings: { ...block.settings, paragraphs } })
  }

  const updateSideCard = (id: string, patch: Partial<CardGridItem>) => {
    const sideCards = (block.settings.sideCards ?? []).map((c) => (c.id === id ? { ...c, ...patch } : c))
    update({ ...block, settings: { ...block.settings, sideCards } })
  }

  const items = wrapSections([
    {
      id: 'content',
      title: 'İçerik',
      defaultOpen: true,
      content: (
        <>
          <SharedContentSection block={block} onChange={update} />
          {!isAboutVariant ? (
            <TextAreaField
              label="Gövde metni"
              hint="Paragraflar ve satır sonları korunur"
              value={block.settings.body ?? ''}
              onChange={(body) => update({ ...block, settings: { ...block.settings, body } })}
              rows={8}
            />
          ) : null}
        </>
      ),
    },
    ...(isAboutVariant
      ? [
          {
            id: 'paragraphs',
            title: 'Paragraflar',
            description: `${(block.settings.paragraphs ?? []).length} paragraf`,
            defaultOpen: true,
            content: (
              <div className="space-y-3">
                {(block.settings.paragraphs ?? []).map((p, index) => (
                  <TextAreaField
                    key={`paragraph-${index}`}
                    label={`Paragraf ${index + 1}`}
                    settingsFieldId={`paragraph-${index}`}
                    value={p}
                    onChange={(value) => updateParagraph(index, value)}
                    rows={3}
                  />
                ))}
                {variant === 'about-split' ? (
                  <TextAreaField
                    label="Vurgu metni"
                    hint="Kalın vurgulanan kapanış cümlesi"
                    settingsFieldId="highlight-text"
                    value={block.settings.highlight ?? ''}
                    onChange={(highlight) =>
                      update({ ...block, settings: { ...block.settings, highlight } })
                    }
                    rows={2}
                  />
                ) : null}
                <AddItemButton
                  onClick={() => {
                    update({
                      ...block,
                      settings: {
                        ...block.settings,
                        paragraphs: [...(block.settings.paragraphs ?? []), ''],
                      },
                    })
                  }}
                >
                  Paragraf ekle
                </AddItemButton>
              </div>
            ),
          },
          ...(variant === 'about-split' || variant === 'about-structure'
            ? [
                {
                  id: 'side-cards',
                  title: variant === 'about-structure' ? 'Değer kartları' : 'Sağ kolon kartları',
                  description: `${(block.settings.sideCards ?? []).length} kart`,
                  content: (
                    <div className="space-y-2">
                      {(block.settings.sideCards ?? []).map((card, i) => (
                        <CollapsibleItem
                          key={card.id}
                          title={`Kart ${i + 1}`}
                          subtitle={card.title || 'Başlıksız'}
                          open={openCardId === card.id}
                          onToggle={() => setOpenCardId(openCardId === card.id ? null : card.id)}
                        >
                          <TextField
                            label="Başlık"
                            settingsFieldId={`card-${card.id}-title`}
                            value={card.title}
                            onChange={(title) => updateSideCard(card.id, { title })}
                          />
                          <TextAreaField
                            label="Açıklama"
                            settingsFieldId={`card-${card.id}-description`}
                            value={card.description}
                            onChange={(description) => updateSideCard(card.id, { description })}
                            rows={3}
                          />
                          {variant === 'about-structure' ? (
                            <TextField
                              label="İkon"
                              hint="Lucide ikon adı"
                              value={card.icon ?? ''}
                              onChange={(icon) => updateSideCard(card.id, { icon })}
                            />
                          ) : null}
                        </CollapsibleItem>
                      ))}
                    </div>
                  ),
                },
              ]
            : []),
        ]
      : []),
    { id: 'design', title: 'Tasarım', content: <SharedDesignSection block={block} onChange={update} /> },
    { id: 'responsive', title: 'Responsive', content: <SharedResponsiveSection block={block} onChange={update} /> },
    { id: 'advanced', title: 'Gelişmiş', content: <SharedAdvancedSection block={block} onChange={update} /> },
  ])

  return <SettingsAccordion items={items} />
}

export function ImageTextSettingsPanel() {
  const { block, update } = useSelectedBlock<ImageTextBlock>()
  if (!block) return null

  const { settings, visibility } = block
  const btn = settings.button ?? { id: 'btn', label: '', href: '/', visible: true, variant: 'primary' as const }

  const items = wrapSections([
    {
      id: 'content',
      title: 'İçerik',
      defaultOpen: true,
      content: (
        <>
          <SharedContentSection block={block} onChange={update} />
          <SelectField
            label="Görsel konumu"
            value={settings.imagePosition}
            onChange={(v) =>
              update({ ...block, settings: { ...settings, imagePosition: v as 'left' | 'right' } })
            }
            options={[
              { value: 'left', label: 'Görsel solda' },
              { value: 'right', label: 'Görsel sağda' },
            ]}
          />
        </>
      ),
    },
    {
      id: 'media',
      title: 'Görsel',
      content: (
        <ImageUrlField
          label="Görsel"
          value={settings.imageUrl ?? ''}
          onChange={(imageUrl) => update({ ...block, settings: { ...settings, imageUrl } })}
        />
      ),
    },
    {
      id: 'button',
      title: 'Buton',
      content: (
        <>
          <ToggleField
            label="Buton göster"
            checked={visibility.showButton !== false && btn.visible !== false}
            onChange={(visible) =>
              update({
                ...block,
                visibility: { ...visibility, showButton: visible },
                settings: { ...settings, button: { ...btn, visible } },
              })
            }
          />
          <TextField label="Buton metni" value={btn.label ?? ''} onChange={(label) => update({ ...block, settings: { ...settings, button: { ...btn, label } } })} />
          <TextField label="Buton linki" value={btn.href ?? ''} onChange={(href) => update({ ...block, settings: { ...settings, button: { ...btn, href } } })} />
        </>
      ),
    },
    { id: 'design', title: 'Tasarım', content: <SharedDesignSection block={block} onChange={update} /> },
    { id: 'responsive', title: 'Responsive', content: <SharedResponsiveSection block={block} onChange={update} /> },
    { id: 'advanced', title: 'Gelişmiş', content: <SharedAdvancedSection block={block} onChange={update} /> },
  ])

  return <SettingsAccordion items={items} />
}
