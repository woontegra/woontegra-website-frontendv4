import type { ReactNode } from 'react'
import {
  SelectField,
  TextField,
  ToggleField,
} from '@/builder/admin/ui/FormFields'
import type { BlockStyle, BlockVisibility, BuilderBlock } from '@/builder/types'

type Props = {
  block: BuilderBlock
  onChange: (block: BuilderBlock) => void
}

export function SharedDesignSection({ block, onChange }: Props) {
  const { style } = block
  return (
    <>
      <TextField
        label="Arka plan rengi"
        hint="Hex veya CSS renk değeri"
        value={style.backgroundColor ?? ''}
        onChange={(backgroundColor) =>
          onChange({ ...block, style: { ...style, backgroundColor: backgroundColor || undefined } })
        }
        placeholder="#ffffff"
      />
      <SelectField
        label="Metin hizalama"
        value={style.contentAlign ?? 'left'}
        onChange={(v) =>
          onChange({
            ...block,
            style: { ...style, contentAlign: v as BlockStyle['contentAlign'] },
          })
        }
        options={[
          { value: 'left', label: 'Sol' },
          { value: 'center', label: 'Orta' },
          { value: 'right', label: 'Sağ' },
        ]}
      />
      <SelectField
        label="Container genişliği"
        hint="İçerik alanının maksimum genişliği"
        value={style.containerWidth ?? 'default'}
        onChange={(v) =>
          onChange({
            ...block,
            style: { ...style, containerWidth: v as BlockStyle['containerWidth'] },
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
  )
}

export function SharedResponsiveSection({ block, onChange }: Props) {
  const { style } = block
  return (
    <>
      <TextField
        label="Üst boşluk — Desktop"
        value={style.paddingTop?.desktop ?? ''}
        onChange={(v) =>
          onChange({ ...block, style: { ...style, paddingTop: { ...style.paddingTop, desktop: v } } })
        }
        placeholder="48px"
      />
      <TextField
        label="Üst boşluk — Mobil"
        value={style.paddingTop?.mobile ?? ''}
        onChange={(v) =>
          onChange({ ...block, style: { ...style, paddingTop: { ...style.paddingTop, mobile: v } } })
        }
        placeholder="32px"
      />
      <TextField
        label="Alt boşluk — Desktop"
        value={style.paddingBottom?.desktop ?? ''}
        onChange={(v) =>
          onChange({
            ...block,
            style: { ...style, paddingBottom: { ...style.paddingBottom, desktop: v } },
          })
        }
        placeholder="48px"
      />
      <TextField
        label="Alt boşluk — Mobil"
        value={style.paddingBottom?.mobile ?? ''}
        onChange={(v) =>
          onChange({
            ...block,
            style: { ...style, paddingBottom: { ...style.paddingBottom, mobile: v } },
          })
        }
        placeholder="32px"
      />
    </>
  )
}

export function SharedAdvancedSection({ block, onChange }: Props) {
  const { visibility, style } = block
  return (
    <>
      <ToggleField
        label="Blok aktif"
        hint="Kapalı blok yayında görünmez"
        checked={visibility.enabled}
        onChange={(enabled) =>
          onChange({ ...block, visibility: { ...visibility, enabled } as BlockVisibility })
        }
      />
      <TextField
        label="Özel CSS sınıfı"
        hint="İleri düzey — opsiyonel"
        value={style.customClass ?? ''}
        onChange={(customClass) =>
          onChange({ ...block, style: { ...style, customClass: customClass || undefined } })
        }
        placeholder="my-custom-section"
      />
    </>
  )
}

export function SharedContentSection({ block, onChange }: Props) {
  const { visibility } = block
  return (
    <>
      <TextField
        label="Başlık"
        settingsFieldId="title"
        value={block.title ?? ''}
        onChange={(title) => onChange({ ...block, title })}
        placeholder="Bölüm başlığı"
      />
      <ToggleField
        label="Başlık göster"
        checked={visibility.showTitle !== false}
        onChange={(showTitle) => onChange({ ...block, visibility: { ...visibility, showTitle } })}
      />
      <TextField
        label="Açıklama"
        settingsFieldId="description"
        value={block.description ?? ''}
        onChange={(description) => onChange({ ...block, description })}
        placeholder="Kısa açıklama"
      />
      <ToggleField
        label="Açıklama göster"
        checked={visibility.showDescription !== false}
        onChange={(showDescription) =>
          onChange({ ...block, visibility: { ...visibility, showDescription } })
        }
      />
    </>
  )
}

export function wrapSections(sections: { id: string; title: string; description?: string; defaultOpen?: boolean; content: ReactNode }[]) {
  return sections.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    defaultOpen: s.defaultOpen,
    children: s.content,
  }))
}
