import { AddItemButton, SelectField, TextAreaField, TextField } from '@/builder/admin/ui/FormFields'
import { SettingsAccordion } from '@/builder/admin/ui/SettingsAccordion'
import { SharedContentSection, wrapSections } from '@/builder/admin/settings/SharedSections'
import { useSelectedBlock } from '@/builder/admin/settings/useSelectedBlock'
import type { MkCompareTableBlock, MkCompareTableCell, MkCompareTableRow, MkCompareValueKey } from '@/builder/types/mkCompareTable'

const VALUE_KEY_OPTIONS = [
  { value: '', label: 'Sabit metin' },
  { value: 'desktop-license', label: 'API: masaüstü lisans süresi' },
  { value: 'desktop-devices', label: 'API: masaüstü cihaz hakkı' },
  { value: 'desktop-price', label: 'API: masaüstü fiyat' },
  { value: 'saas-years', label: 'SaaS yıl seçimi (sabit metin)' },
  { value: 'saas-price', label: 'API: SaaS fiyat × yıl' },
]

const TONE_OPTIONS = [
  { value: 'check', label: 'Onay' },
  { value: 'neutral', label: 'Nötr' },
  { value: 'saas', label: 'SaaS vurgusu' },
  { value: 'info', label: 'Bilgi / API' },
]

export function MkCompareTableSettingsPanel() {
  const { block, update } = useSelectedBlock<MkCompareTableBlock>()
  if (!block) return null

  const { settings } = block
  const setSettings = (patch: Partial<MkCompareTableBlock['settings']>) =>
    update({ ...block, settings: { ...settings, ...patch } })

  const updateRow = (id: string, patch: Partial<MkCompareTableRow>) =>
    setSettings({ rows: settings.rows.map((row) => (row.id === id ? { ...row, ...patch } : row)) })

  const updateCell = (id: string, side: 'desktop' | 'saas', patch: Partial<MkCompareTableCell>) =>
    updateRow(id, { [side]: { ...settings.rows.find((row) => row.id === id)![side], ...patch } })

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
            value={settings.anchorId}
            onChange={(anchorId) => setSettings({ anchorId })}
          />
          <TextField
            label="Masaüstü sütun başlığı"
            value={settings.desktopColumnLabel}
            onChange={(desktopColumnLabel) => setSettings({ desktopColumnLabel })}
          />
          <TextField
            label="SaaS sütun başlığı"
            value={settings.saasColumnLabel}
            onChange={(saasColumnLabel) => setSettings({ saasColumnLabel })}
          />
        </>
      ),
    },
    {
      id: 'rows',
      title: 'Karşılaştırma satırları',
      defaultOpen: true,
      content: (
        <div className="space-y-3">
          {settings.rows.map((row, index) => (
            <div key={row.id} className="space-y-2 rounded-lg border border-slate-200 p-3">
              <TextField
                label={`Özellik ${index + 1}`}
                value={row.feature}
                onChange={(feature) => updateRow(row.id, { feature })}
              />
              <TextAreaField
                label="Masaüstü metni"
                value={row.desktop.text}
                onChange={(text) => updateCell(row.id, 'desktop', { text })}
                rows={2}
              />
              <SelectField
                label="Masaüstü değer kaynağı"
                value={row.desktop.valueKey ?? ''}
                onChange={(valueKey) =>
                  updateCell(row.id, 'desktop', {
                    valueKey: (valueKey || undefined) as MkCompareValueKey | undefined,
                  })
                }
                options={VALUE_KEY_OPTIONS}
              />
              <SelectField
                label="Masaüstü ton"
                value={row.desktop.tone}
                onChange={(tone) => updateCell(row.id, 'desktop', { tone: tone as MkCompareTableCell['tone'] })}
                options={TONE_OPTIONS}
              />
              <TextAreaField
                label="SaaS metni"
                value={row.saas.text}
                onChange={(text) => updateCell(row.id, 'saas', { text })}
                rows={2}
              />
              <SelectField
                label="SaaS değer kaynağı"
                value={row.saas.valueKey ?? ''}
                onChange={(valueKey) =>
                  updateCell(row.id, 'saas', {
                    valueKey: (valueKey || undefined) as MkCompareValueKey | undefined,
                  })
                }
                options={VALUE_KEY_OPTIONS}
              />
              <SelectField
                label="SaaS ton"
                value={row.saas.tone}
                onChange={(tone) => updateCell(row.id, 'saas', { tone: tone as MkCompareTableCell['tone'] })}
                options={TONE_OPTIONS}
              />
              <TextField
                label="Masaüstü ipucu"
                value={row.desktop.hint ?? ''}
                onChange={(hint) => updateCell(row.id, 'desktop', { hint: hint || undefined })}
              />
              <TextField
                label="SaaS ipucu"
                value={row.saas.hint ?? ''}
                onChange={(hint) => updateCell(row.id, 'saas', { hint: hint || undefined })}
              />
              <button
                type="button"
                className="text-xs text-rose-600 hover:underline"
                onClick={() => setSettings({ rows: settings.rows.filter((item) => item.id !== row.id) })}
              >
                Satırı sil
              </button>
            </div>
          ))}
          <AddItemButton
            onClick={() =>
              setSettings({
                rows: [
                  ...settings.rows,
                  {
                    id: `row-${Date.now()}`,
                    feature: 'Yeni özellik',
                    desktop: { tone: 'neutral', text: '' },
                    saas: { tone: 'check', text: '' },
                  },
                ],
              })
            }
          >
            Satır ekle
          </AddItemButton>
        </div>
      ),
    },
  ])

  return <SettingsAccordion items={items} />
}
