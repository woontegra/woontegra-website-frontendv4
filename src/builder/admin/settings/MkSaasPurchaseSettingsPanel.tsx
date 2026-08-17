import {
  AddItemButton,
  SelectField,
  TextField,
} from '@/builder/admin/ui/FormFields'
import { SettingsAccordion } from '@/builder/admin/ui/SettingsAccordion'
import { SharedContentSection, wrapSections } from '@/builder/admin/settings/SharedSections'
import { useSelectedBlock } from '@/builder/admin/settings/useSelectedBlock'
import type { MkSaasPurchaseBlock } from '@/builder/types'

export function MkSaasPurchaseSettingsPanel() {
  const { block, update } = useSelectedBlock<MkSaasPurchaseBlock>()
  if (!block) return null

  const { settings } = block
  const setSettings = (patch: Partial<MkSaasPurchaseBlock['settings']>) =>
    update({ ...block, settings: { ...settings, ...patch } })

  const items = wrapSections([
    {
      id: 'content',
      title: 'İçerik',
      defaultOpen: true,
      content: (
        <>
          <SharedContentSection block={block} onChange={update} />
          <TextField
            label="Anchor ID"
            hint="Hedef bağlantı — varsayılan: satin-alma"
            value={settings.anchorId}
            onChange={(anchorId) => setSettings({ anchorId })}
          />
          <SelectField
            label="Arka plan"
            value={settings.backgroundStyle}
            onChange={(v) => setSettings({ backgroundStyle: v as 'gradient' | 'solid' })}
            options={[
              { value: 'gradient', label: 'Gradient' },
              { value: 'solid', label: 'Düz beyaz' },
            ]}
          />
          <p className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-900">
            Fiyat, sepet, lisans süresi ve demo handler admin panelinden değiştirilemez — API ürün verisinden gelir.
          </p>
        </>
      ),
    },
    {
      id: 'benefits',
      title: 'Sol fayda maddeleri',
      content: (
        <div className="space-y-3">
          {settings.benefits.map((item, index) => (
            <div key={item.id} className="rounded-lg border border-slate-200 p-3">
              <TextField
                label={`Madde ${index + 1}`}
                value={item.text}
                onChange={(text) =>
                  setSettings({
                    benefits: settings.benefits.map((b) => (b.id === item.id ? { ...b, text } : b)),
                  })
                }
              />
              <SelectField
                label="İkon"
                value={item.icon ?? 'cloud'}
                onChange={(icon) =>
                  setSettings({
                    benefits: settings.benefits.map((b) => (b.id === item.id ? { ...b, icon } : b)),
                  })
                }
                options={[
                  { value: 'cloud', label: 'Bulut' },
                  { value: 'globe', label: 'Dünya' },
                  { value: 'message-circle', label: 'Mesaj' },
                ]}
              />
            </div>
          ))}
          <AddItemButton onClick={() =>
              setSettings({
                benefits: [
                  ...settings.benefits,
                  { id: `benefit-${Date.now()}`, text: 'Yeni madde', icon: 'cloud' },
                ],
              })
            }>
            Fayda maddesi ekle
          </AddItemButton>
        </div>
      ),
    },
  ])

  return <SettingsAccordion items={items} />
}
