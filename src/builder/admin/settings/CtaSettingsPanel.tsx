import { SettingsAccordion } from '@/builder/admin/ui/SettingsAccordion'
import {
  ImageUrlField,
  RadioCardGroup,
  SelectField,
  TextField,
  ToggleField,
} from '@/builder/admin/ui/FormFields'
import {
  SharedAdvancedSection,
  SharedContentSection,
  SharedDesignSection,
  SharedResponsiveSection,
  wrapSections,
} from '@/builder/admin/settings/SharedSections'
import { useSelectedBlock } from '@/builder/admin/settings/useSelectedBlock'
import type { BlockButton, CtaBlock } from '@/builder/types'

export function CtaSettingsPanel() {
  const { block, update } = useSelectedBlock<CtaBlock>()
  if (!block) return null

  const { settings, visibility } = block
  const buttons = ensureTwoButtons(settings.buttons)

  const setBtn = (idx: number, patch: Partial<BlockButton>) => {
    const next = [...buttons]
    next[idx] = { ...next[idx], ...patch }
    update({ ...block, settings: { ...settings, buttons: next } })
  }

  const items = wrapSections([
    {
      id: 'content',
      title: 'İçerik',
      defaultOpen: true,
      content: <SharedContentSection block={block} onChange={update} />,
    },
    {
      id: 'buttons',
      title: 'Butonlar',
      description: 'Primary ve secondary CTA',
      content: (
        <div className="space-y-3">
          <ButtonEditor
            label="Primary Button"
            btn={buttons[0]}
            onChange={(p) => setBtn(0, p)}
            settingsFieldId="button-0"
          />
          <ButtonEditor
            label="Secondary Button"
            btn={buttons[1]}
            onChange={(p) => setBtn(1, p)}
            settingsFieldId="button-1"
          />
          <ToggleField
            label="Butonları göster"
            checked={visibility.showButton !== false}
            onChange={(showButton) =>
              update({ ...block, visibility: { ...visibility, showButton } })
            }
          />
        </div>
      ),
    },
    {
      id: 'design',
      title: 'Tasarım',
      content: (
        <>
          <RadioCardGroup
            label="Background"
            value={settings.backgroundType}
            onChange={(v) =>
              update({
                ...block,
                settings: { ...settings, backgroundType: v as CtaBlock['settings']['backgroundType'] },
              })
            }
            options={[
              { value: 'gradient', label: 'Gradient' },
              { value: 'solid', label: 'Düz renk' },
              { value: 'image', label: 'Görsel' },
            ]}
          />
          {settings.backgroundType === 'gradient' ? (
            <TextField
              label="Gradient CSS"
              value={settings.gradient ?? ''}
              onChange={(gradient) => update({ ...block, settings: { ...settings, gradient } })}
            />
          ) : null}
          {settings.backgroundType === 'image' ? (
            <ImageUrlField
              label="Arka plan görseli"
              value={settings.imageUrl ?? ''}
              onChange={(imageUrl) => update({ ...block, settings: { ...settings, imageUrl } })}
            />
          ) : null}
          <TextField
            label="Border radius"
            value={settings.borderRadius ?? '16px'}
            onChange={(borderRadius) => update({ ...block, settings: { ...settings, borderRadius } })}
          />
          <SharedDesignSection block={block} onChange={update} />
        </>
      ),
    },
    {
      id: 'responsive',
      title: 'Responsive',
      content: (
        <>
          <SharedResponsiveSection block={block} onChange={update} />
          <SelectField
            label="Container"
            value={block.style.containerWidth ?? 'default'}
            onChange={(v) =>
              update({
                ...block,
                style: { ...block.style, containerWidth: v as CtaBlock['style']['containerWidth'] },
              })
            }
            options={[
              { value: 'narrow', label: 'Dar' },
              { value: 'default', label: 'Varsayılan' },
              { value: 'wide', label: 'Geniş' },
              { value: 'full', label: 'Tam genişlik' },
            ]}
          />
        </>
      ),
    },
    {
      id: 'advanced',
      title: 'Gelişmiş',
      content: <SharedAdvancedSection block={block} onChange={update} />,
    },
  ])

  return <SettingsAccordion items={items} />
}

function ButtonEditor({
  label,
  btn,
  onChange,
  settingsFieldId,
}: {
  label: string
  btn: BlockButton
  onChange: (p: Partial<BlockButton>) => void
  settingsFieldId?: string
}) {
  return (
    <div className="rounded-xl border border-slate-100 p-3" data-builder-settings-field={settingsFieldId}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <ToggleField label="Göster" checked={btn.visible !== false} onChange={(visible) => onChange({ visible })} />
      <TextField label="Metin" value={btn.label ?? ''} onChange={(label) => onChange({ label })} />
      <TextField label="Link" value={btn.href ?? ''} onChange={(href) => onChange({ href })} />
    </div>
  )
}

function ensureTwoButtons(buttons: BlockButton[]): BlockButton[] {
  const list = [...buttons]
  while (list.length < 2) {
    list.push({
      id: `cta-${list.length}`,
      label: list.length === 0 ? 'Başla' : 'Daha fazla',
      href: '/',
      visible: true,
      variant: list.length === 0 ? 'primary' : 'outline',
    })
  }
  return list.slice(0, 2)
}
