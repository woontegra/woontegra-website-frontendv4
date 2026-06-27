import { useState } from 'react'
import { SettingsAccordion, CollapsibleItem } from '@/builder/admin/ui/SettingsAccordion'
import {
  AddItemButton,
  ImageUrlField,
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
import { useFocusCollapsible } from '@/builder/admin/settings/useFocusCollapsible'
import type { CardGridBlock, CardGridItem } from '@/builder/types'

export function CardGridSettingsPanel() {
  const { block, update } = useSelectedBlock<CardGridBlock>()
  const [openId, setOpenId] = useState<string | null>(null)
  useFocusCollapsible(setOpenId)
  if (!block) return null

  const { settings } = block

  const updateCard = (id: string, patch: Partial<CardGridItem>) => {
    update({
      ...block,
      settings: {
        ...settings,
        cards: settings.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      },
    })
  }

  const items = wrapSections([
    {
      id: 'grid',
      title: 'Grid',
      defaultOpen: true,
      content: (
        <>
          <SelectField
            label="Grid varyantı"
            hint="Ana sayfa bölüm stili"
            value={settings.variant ?? 'default'}
            onChange={(v) =>
              update({
                ...block,
                settings: { ...settings, variant: v as CardGridBlock['settings']['variant'] },
              })
            }
            options={[
              { value: 'default', label: 'Varsayılan' },
              { value: 'intro', label: 'Intro (3 kart)' },
              { value: 'icon-dark', label: 'Hizmetler (koyu)' },
              { value: 'logo', label: 'Marka / logo' },
              { value: 'steps', label: 'Süreç adımları' },
              { value: 'why', label: 'Neden biz' },
              { value: 'solutions', label: 'Çözümler vitrini' },
              { value: 'timeline', label: 'Zaman çizelgesi (dikey)' },
              { value: 'about-brands', label: 'Marka kartları (hakkımızda)' },
            ]}
          />
          {settings.variant === 'intro' || settings.variant === 'solutions' ? (
            <TextField
              label="Üst küçük başlık"
              settingsFieldId="eyebrow"
              value={settings.eyebrow ?? ''}
              onChange={(eyebrow) => update({ ...block, settings: { ...settings, eyebrow } })}
            />
          ) : null}
          <SelectField
            label="Kolon sayısı"
            value={String(settings.columns)}
            onChange={(v) =>
              update({ ...block, settings: { ...settings, columns: Number(v) as 2 | 3 | 4 } })
            }
            options={[
              { value: '2', label: '2 kolon' },
              { value: '3', label: '3 kolon' },
              { value: '4', label: '4 kolon' },
            ]}
          />
          <SharedContentSection block={block} onChange={update} />
        </>
      ),
    },
    {
      id: 'cards',
      title: 'Kart listesi',
      description: `${settings.cards.length} kart`,
      content: (
        <div className="space-y-2">
          {settings.cards.map((card, i) => (
            <CollapsibleItem
              key={card.id}
              title={`Kart ${i + 1}`}
              subtitle={card.title || 'Başlıksız'}
              open={openId === card.id}
              onToggle={() => setOpenId(openId === card.id ? null : card.id)}
              onRemove={
                settings.cards.length > 1
                  ? () =>
                      update({
                        ...block,
                        settings: { ...settings, cards: settings.cards.filter((c) => c.id !== card.id) },
                      })
                  : undefined
              }
            >
              <TextField
                label="Başlık"
                settingsFieldId={`card-${card.id}-title`}
                value={card.title}
                onChange={(title) => updateCard(card.id, { title })}
              />
              <TextField
                label="Açıklama"
                settingsFieldId={`card-${card.id}-description`}
                value={card.description}
                onChange={(description) => updateCard(card.id, { description })}
              />
              <TextField
                label="İkon"
                hint="Lucide ikon adı — örn. sparkles"
                value={card.icon ?? ''}
                onChange={(icon) => updateCard(card.id, { icon })}
              />
              <ImageUrlField
                label="Görsel"
                settingsFieldId={`card-${card.id}-image`}
                value={card.imageUrl ?? ''}
                onChange={(imageUrl) => updateCard(card.id, { imageUrl })}
              />
              <TextField
                label="Buton metni"
                value={card.buttonLabel ?? ''}
                onChange={(buttonLabel) => updateCard(card.id, { buttonLabel })}
              />
              <TextField
                label="Link"
                settingsFieldId={`card-${card.id}-href`}
                value={card.href ?? ''}
                onChange={(href) => updateCard(card.id, { href })}
              />
              <TextField
                label="Renk"
                hint="Kart vurgu rengi"
                value={card.color ?? ''}
                onChange={(color) => updateCard(card.id, { color })}
                placeholder="#059669"
              />
            </CollapsibleItem>
          ))}
          <AddItemButton
            onClick={() => {
              const id = `card-${Date.now()}`
              update({
                ...block,
                settings: {
                  ...settings,
                  cards: [...settings.cards, { id, title: 'Yeni kart', description: '' }],
                },
              })
              setOpenId(id)
            }}
          >
            Kart ekle
          </AddItemButton>
        </div>
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
