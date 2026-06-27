import { useState } from 'react'
import { SettingsAccordion, CollapsibleItem } from '@/builder/admin/ui/SettingsAccordion'
import { AddItemButton, TextAreaField, TextField } from '@/builder/admin/ui/FormFields'
import {
  SharedAdvancedSection,
  SharedContentSection,
  SharedDesignSection,
  SharedResponsiveSection,
  wrapSections,
} from '@/builder/admin/settings/SharedSections'
import { useSelectedBlock } from '@/builder/admin/settings/useSelectedBlock'
import { useFocusCollapsible } from '@/builder/admin/settings/useFocusCollapsible'
import type { FaqBlock } from '@/builder/types'

export function FaqSettingsPanel() {
  const { block, update } = useSelectedBlock<FaqBlock>()
  const [openId, setOpenId] = useState<string | null>(null)
  useFocusCollapsible(setOpenId)
  if (!block) return null

  const { settings } = block

  const updateItem = (id: string, patch: Partial<(typeof settings.items)[0]>) => {
    update({
      ...block,
      settings: {
        ...settings,
        items: settings.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      },
    })
  }

  const items = wrapSections([
    {
      id: 'header',
      title: 'İçerik',
      defaultOpen: true,
      content: <SharedContentSection block={block} onChange={update} />,
    },
    {
      id: 'questions',
      title: 'Soru listesi',
      description: `${settings.items.length} soru`,
      content: (
        <div className="space-y-2">
          {settings.items.map((item, i) => (
            <CollapsibleItem
              key={item.id}
              title={`Soru ${i + 1}`}
              subtitle={item.question || 'Boş soru'}
              open={openId === item.id}
              onToggle={() => setOpenId(openId === item.id ? null : item.id)}
              onRemove={
                settings.items.length > 1
                  ? () =>
                      update({
                        ...block,
                        settings: { ...settings, items: settings.items.filter((x) => x.id !== item.id) },
                      })
                  : undefined
              }
            >
              <TextField
                label="Soru metni"
                settingsFieldId={`faq-${item.id}-question`}
                value={item.question}
                onChange={(question) => updateItem(item.id, { question })}
                required
                emptyWarning="Soru metni boş — yayında görünmez"
              />
              <TextAreaField
                label="Cevap metni"
                settingsFieldId={`faq-${item.id}-answer`}
                value={item.answer}
                onChange={(answer) => updateItem(item.id, { answer })}
                rows={4}
              />
            </CollapsibleItem>
          ))}
          <AddItemButton
            onClick={() => {
              const id = `faq-${Date.now()}`
              update({
                ...block,
                settings: {
                  ...settings,
                  items: [...settings.items, { id, question: 'Yeni soru?', answer: '' }],
                },
              })
              setOpenId(id)
            }}
          >
            Soru ekle
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
