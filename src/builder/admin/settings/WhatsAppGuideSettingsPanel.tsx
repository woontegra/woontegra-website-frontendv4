import {
  ImageUrlField,
  TextAreaField,
  TextField,
  ToggleField,
} from '@/builder/admin/ui/FormFields'
import { SettingsAccordion } from '@/builder/admin/ui/SettingsAccordion'
import { SharedContentSection, wrapSections } from '@/builder/admin/settings/SharedSections'
import { useSelectedBlock } from '@/builder/admin/settings/useSelectedBlock'
import type { WhatsAppGuideBlock, WhatsAppGuideStep } from '@/builder/types'
import { whatsAppGuideIphoneStepsComplete } from '@/builder/types'

const IMAGE_HINT =
  'Telefon numarası, e-posta, kişi ve konuşma bilgilerini yüklemeden önce bulanıklaştırın.'

function StepEditor({
  step,
  onChange,
  onRemove,
}: {
  step: WhatsAppGuideStep
  onChange: (patch: Partial<WhatsAppGuideStep>) => void
  onRemove?: () => void
}) {
  return (
    <div className="space-y-2 rounded-lg border border-slate-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-500">Adım {step.stepNumber}</p>
        {onRemove ? (
          <button type="button" onClick={onRemove} className="text-xs text-rose-600 hover:underline">
            Sil
          </button>
        ) : null}
      </div>
      <TextField label="Başlık" value={step.title} onChange={(title) => onChange({ title })} />
      <TextAreaField label="Açıklama" value={step.description} onChange={(description) => onChange({ description })} />
      <TextField label="Resmî menü yolu" value={step.officialPath} onChange={(officialPath) => onChange({ officialPath })} />
      <ImageUrlField
        label="Ekran görüntüsü"
        hint={IMAGE_HINT}
        value={step.image?.url ?? ''}
        onChange={(url) => onChange({ image: { url, alt: step.imageAlt }, imageAlt: step.imageAlt })}
        uploadFolder="builder"
      />
      <TextField label="Görsel alt metni" value={step.imageAlt} onChange={(imageAlt) => onChange({ imageAlt })} />
      <TextField label="Resmî bağlantı (opsiyonel)" value={step.officialUrl ?? ''} onChange={(officialUrl) => onChange({ officialUrl })} />
      <ToggleField label="Görünür" checked={step.visible} onChange={(visible) => onChange({ visible })} />
    </div>
  )
}

function PlatformStepsEditor({
  label,
  steps,
  onChange,
}: {
  label: string
  steps: WhatsAppGuideStep[]
  onChange: (steps: WhatsAppGuideStep[]) => void
}) {
  const updateStep = (id: string, patch: Partial<WhatsAppGuideStep>) => {
    onChange(steps.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      {steps.map((step) => (
        <StepEditor key={step.id} step={step} onChange={(patch) => updateStep(step.id, patch)} />
      ))}
    </div>
  )
}

export function WhatsAppGuideSettingsPanel() {
  const { block, update } = useSelectedBlock<WhatsAppGuideBlock>()
  if (!block) return null

  const { settings } = block
  const setSettings = (patch: Partial<WhatsAppGuideBlock['settings']>) =>
    update({ ...block, settings: { ...settings, ...patch } })

  const iphoneReady = whatsAppGuideIphoneStepsComplete(settings.iphoneSteps)

  const items = wrapSections([
    {
      id: 'general',
      title: 'Genel',
      defaultOpen: true,
      content: (
        <>
          <SharedContentSection block={block} onChange={update} />
          <TextField label="Üst etiket" value={settings.eyebrow ?? ''} onChange={(eyebrow) => setSettings({ eyebrow })} />
          <TextField
            label="Güvenlik uyarısı başlığı"
            value={settings.securityWarningTitle ?? ''}
            onChange={(securityWarningTitle) => setSettings({ securityWarningTitle })}
          />
          <TextAreaField
            label="Güvenlik uyarısı metni"
            value={settings.securityWarningBody ?? ''}
            onChange={(securityWarningBody) => setSettings({ securityWarningBody })}
          />
          <TextField
            label="Resmî rehber bağlantısı"
            value={settings.officialGuideUrl ?? ''}
            onChange={(officialGuideUrl) => setSettings({ officialGuideUrl })}
          />
          <ToggleField
            label="Android etkin"
            checked={settings.androidEnabled}
            onChange={(androidEnabled) => setSettings({ androidEnabled })}
          />
          <ToggleField
            label="iPhone etkin"
            checked={settings.iphoneEnabled}
            onChange={(iphoneEnabled) => {
              if (iphoneEnabled && !iphoneReady) return
              setSettings({ iphoneEnabled })
            }}
          />
          {!iphoneReady ? (
            <p className="text-xs text-amber-700">
              iPhone platformunu etkinleştirmek için tüm iPhone adımlarına görsel yükleyin.
            </p>
          ) : null}
        </>
      ),
    },
    {
      id: 'android',
      title: 'Android adımları',
      content: (
        <PlatformStepsEditor
          label="Android"
          steps={settings.androidSteps}
          onChange={(androidSteps) => setSettings({ androidSteps })}
        />
      ),
    },
    {
      id: 'iphone',
      title: 'iPhone adımları',
      content: (
        <PlatformStepsEditor
          label="iPhone"
          steps={settings.iphoneSteps}
          onChange={(iphoneSteps) => setSettings({ iphoneSteps })}
        />
      ),
    },
    {
      id: 'connection',
      title: 'MK Meta bağlantısı (Adım 6)',
      content: (
        <StepEditor
          step={settings.connectionStep}
          onChange={(patch) => setSettings({ connectionStep: { ...settings.connectionStep, ...patch } })}
        />
      ),
    },
  ])

  return <SettingsAccordion items={items} />
}
