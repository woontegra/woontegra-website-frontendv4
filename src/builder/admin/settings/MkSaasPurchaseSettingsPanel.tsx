import {
  AddItemButton,
  ImageUrlField,
  SelectField,
  TextAreaField,
  TextField,
} from '@/builder/admin/ui/FormFields'
import { SettingsAccordion } from '@/builder/admin/ui/SettingsAccordion'
import { SharedContentSection, wrapSections } from '@/builder/admin/settings/SharedSections'
import { useSelectedBlock } from '@/builder/admin/settings/useSelectedBlock'
import type { MkComparePurchaseCardCopy, MkSaasPurchaseBlock } from '@/builder/types'
import {
  DEFAULT_MK_COMPARE_DESKTOP_COPY,
  DEFAULT_MK_COMPARE_SAAS_COPY,
} from '@/builder/types/mkSaasPurchase'

export function MkSaasPurchaseSettingsPanel() {
  const { block, update } = useSelectedBlock<MkSaasPurchaseBlock>()
  if (!block) return null

  const { settings } = block
  const setSettings = (patch: Partial<MkSaasPurchaseBlock['settings']>) =>
    update({ ...block, settings: { ...settings, ...patch } })
  const patchDesktop = (patch: Partial<MkComparePurchaseCardCopy>) =>
    setSettings({
      compareDesktop: { ...(settings.compareDesktop ?? DEFAULT_MK_COMPARE_DESKTOP_COPY), ...patch },
    })
  const patchSaas = (patch: Partial<MkComparePurchaseCardCopy>) =>
    setSettings({
      compareSaas: { ...(settings.compareSaas ?? DEFAULT_MK_COMPARE_SAAS_COPY), ...patch },
    })

  const items = wrapSections([
    {
      id: 'content',
      title: 'İçerik',
      defaultOpen: true,
      content: (
        <>
          <SharedContentSection block={block} onChange={update} />
          <SelectField
            label="Yerleşim"
            value={settings.layout ?? 'saas'}
            onChange={(v) => {
              const layout = v as 'saas' | 'compare'
              if (layout === 'compare') {
                setSettings({
                  layout,
                  compareDesktop: settings.compareDesktop ?? DEFAULT_MK_COMPARE_DESKTOP_COPY,
                  compareSaas: settings.compareSaas ?? DEFAULT_MK_COMPARE_SAAS_COPY,
                })
                return
              }
              setSettings({ layout })
            }}
            options={[
              { value: 'saas', label: 'Tek ürün (SaaS)' },
              { value: 'compare', label: 'Müvekkil Kasa karşılaştırma kartları' },
            ]}
          />
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
      title: settings.layout === 'compare' ? 'Kart metinleri' : 'Sol fayda maddeleri',
      content:
        settings.layout === 'compare' ? (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-slate-500">Masaüstü kartı</p>
            <TextField
              label="Rozet"
              value={settings.compareDesktop?.badge ?? ''}
              onChange={(badge) => patchDesktop({ badge })}
            />
            <TextField
              label="Başlık"
              value={settings.compareDesktop?.title ?? ''}
              onChange={(title) => patchDesktop({ title })}
            />
            <TextAreaField
              label="Açıklama"
              value={settings.compareDesktop?.description ?? ''}
              onChange={(description) => patchDesktop({ description })}
              rows={3}
            />
            <ImageUrlField
              label="Kart görseli (boşsa API kapak)"
              value={settings.compareDesktop?.imageUrl ?? ''}
              onChange={(imageUrl) => patchDesktop({ imageUrl })}
            />
            <TextField
              label="Detay butonu"
              value={settings.compareDesktop?.detailsButtonLabel ?? ''}
              onChange={(detailsButtonLabel) => patchDesktop({ detailsButtonLabel })}
            />
            <TextField
              label="Sepet butonu"
              value={settings.compareDesktop?.addToCartLabel ?? ''}
              onChange={(addToCartLabel) => patchDesktop({ addToCartLabel })}
            />
            <p className="text-xs font-semibold text-slate-500">SaaS kartı</p>
            <TextField
              label="Rozet"
              value={settings.compareSaas?.badge ?? ''}
              onChange={(badge) => patchSaas({ badge })}
            />
            <TextField
              label="Ek rozet"
              value={settings.compareSaas?.extraBadge ?? ''}
              onChange={(extraBadge) => patchSaas({ extraBadge })}
            />
            <TextField
              label="Başlık"
              value={settings.compareSaas?.title ?? ''}
              onChange={(title) => patchSaas({ title })}
            />
            <TextAreaField
              label="Açıklama"
              value={settings.compareSaas?.description ?? ''}
              onChange={(description) => patchSaas({ description })}
              rows={3}
            />
            <ImageUrlField
              label="Kart görseli (boşsa API kapak)"
              value={settings.compareSaas?.imageUrl ?? ''}
              onChange={(imageUrl) => patchSaas({ imageUrl })}
            />
            <TextField
              label="Demo butonu"
              value={settings.compareSaas?.demoButtonLabel ?? ''}
              onChange={(demoButtonLabel) => patchSaas({ demoButtonLabel })}
            />
            <TextField
              label="Detay butonu"
              value={settings.compareSaas?.detailsButtonLabel ?? ''}
              onChange={(detailsButtonLabel) => patchSaas({ detailsButtonLabel })}
            />
            <TextField
              label="Sepet butonu"
              value={settings.compareSaas?.addToCartLabel ?? ''}
              onChange={(addToCartLabel) => patchSaas({ addToCartLabel })}
            />
          </div>
        ) : (
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
