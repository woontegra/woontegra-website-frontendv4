import { AddItemButton, ImageUrlField, TextAreaField, TextField, ToggleField } from '@/builder/admin/ui/FormFields'
import { SettingsAccordion } from '@/builder/admin/ui/SettingsAccordion'
import { SharedContentSection, wrapSections } from '@/builder/admin/settings/SharedSections'
import { useSelectedBlock } from '@/builder/admin/settings/useSelectedBlock'
import type { MkCompareDetailsBlock, MkCompareDetailsPanel } from '@/builder/types/mkCompareDetails'

function PanelEditor({
  title,
  panel,
  onChange,
}: {
  title: string
  panel: MkCompareDetailsPanel
  onChange: (patch: Partial<MkCompareDetailsPanel>) => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <TextField label="Sekme başlığı" value={panel.tabLabel} onChange={(tabLabel) => onChange({ tabLabel })} />
      <TextField label="Genel bakış rozeti" value={panel.overviewEyebrow} onChange={(overviewEyebrow) => onChange({ overviewEyebrow })} />
      <TextField label="Genel bakış başlığı" value={panel.overviewTitle} onChange={(overviewTitle) => onChange({ overviewTitle })} />
      <ToggleField
        label="API ürün açıklamasını kullan"
        checked={panel.useProductDescription}
        onChange={(useProductDescription) => onChange({ useProductDescription })}
      />
      {panel.useProductDescription ? null : (
        <TextAreaField
          label="Özel açıklama (HTML)"
          value={panel.descriptionHtml}
          onChange={(descriptionHtml) => onChange({ descriptionHtml })}
          rows={5}
        />
      )}
      <TextField label="Özellik rozeti" value={panel.featuresEyebrow} onChange={(featuresEyebrow) => onChange({ featuresEyebrow })} />
      <TextField label="Özellik başlığı" value={panel.featuresTitle} onChange={(featuresTitle) => onChange({ featuresTitle })} />
      <ToggleField
        label="API özellik listesini kullan"
        checked={panel.useProductFeatures}
        onChange={(useProductFeatures) => onChange({ useProductFeatures })}
      />
      {panel.useProductFeatures ? null : (
        <div className="space-y-2">
          {panel.features.map((item, index) => (
            <TextField
              key={`${title}-feature-${index}`}
              label={`Özellik ${index + 1}`}
              value={item}
              onChange={(value) =>
                onChange({ features: panel.features.map((current, i) => (i === index ? value : current)) })
              }
            />
          ))}
          <AddItemButton onClick={() => onChange({ features: [...panel.features, 'Yeni özellik'] })}>
            Özellik ekle
          </AddItemButton>
        </div>
      )}
      <ImageUrlField
        label="Panel görseli"
        value={panel.image?.url ?? ''}
        onChange={(url) => onChange({ image: { ...panel.image, url } })}
      />
      <TextField
        label="Görsel alt metni"
        value={panel.image?.alt ?? ''}
        onChange={(alt) => onChange({ image: { ...panel.image, alt } })}
      />
      <TextField
        label="Birincil CTA"
        value={panel.primaryCtaLabel}
        onChange={(primaryCtaLabel) => onChange({ primaryCtaLabel })}
      />
      <TextField
        label="İkincil CTA"
        value={panel.secondaryCtaLabel}
        onChange={(secondaryCtaLabel) => onChange({ secondaryCtaLabel })}
      />
      {panel.demoCtaLabel != null ? (
        <TextField
          label="Demo CTA"
          value={panel.demoCtaLabel}
          onChange={(demoCtaLabel) => onChange({ demoCtaLabel })}
        />
      ) : null}
    </div>
  )
}

export function MkCompareDetailsSettingsPanel() {
  const { block, update } = useSelectedBlock<MkCompareDetailsBlock>()
  if (!block) return null

  const { settings } = block
  const setSettings = (patch: Partial<MkCompareDetailsBlock['settings']>) =>
    update({ ...block, settings: { ...settings, ...patch } })

  const items = wrapSections([
    {
      id: 'content',
      title: 'Bölüm',
      defaultOpen: true,
      content: (
        <>
          <SharedContentSection block={block} onChange={update} />
          <TextField
            label="Anchor ID"
            value={settings.anchorId}
            onChange={(anchorId) => setSettings({ anchorId })}
          />
        </>
      ),
    },
    {
      id: 'desktop',
      title: 'Masaüstü sekmesi',
      defaultOpen: true,
      content: (
        <PanelEditor
          title="Masaüstü"
          panel={settings.desktop}
          onChange={(patch) => setSettings({ desktop: { ...settings.desktop, ...patch } })}
        />
      ),
    },
    {
      id: 'saas',
      title: 'SaaS sekmesi',
      content: (
        <PanelEditor
          title="SaaS"
          panel={settings.saas}
          onChange={(patch) => setSettings({ saas: { ...settings.saas, ...patch } })}
        />
      ),
    },
  ])

  return <SettingsAccordion items={items} />
}
