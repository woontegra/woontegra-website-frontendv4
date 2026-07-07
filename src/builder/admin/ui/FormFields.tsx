import { useState, type ReactNode } from 'react'
import { MediaPickerModal } from '@/media/components/MediaPickerModal'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import { catalogMediaPickUrl } from '@/types/catalogMedia'
import { cn } from '@/lib/cn'

export function FieldLabel({
  label,
  hint,
  tooltip,
  required,
}: {
  label: string
  hint?: string
  tooltip?: string
  required?: boolean
}) {
  return (
    <div className="mb-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-slate-700">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </span>
        {tooltip ? (
          <span
            title={tooltip}
            className="cursor-help rounded-full bg-slate-100 px-1.5 text-[10px] text-slate-500"
          >
            ?
          </span>
        ) : null}
      </div>
      {hint ? <p className="text-[11px] leading-relaxed text-slate-400">{hint}</p> : null}
    </div>
  )
}

export function TextField({
  label,
  hint,
  tooltip,
  value,
  onChange,
  placeholder,
  required,
  emptyWarning,
  settingsFieldId,
}: {
  label: string
  hint?: string
  tooltip?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  emptyWarning?: string
  settingsFieldId?: string
}) {
  const empty = required && !value.trim()
  return (
    <div data-builder-settings-field={settingsFieldId}>
      <FieldLabel label={label} hint={hint} tooltip={tooltip} required={required} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none transition',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          empty ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200 bg-white',
        )}
      />
      {empty && emptyWarning ? (
        <p className="mt-1 text-[11px] text-amber-600">{emptyWarning}</p>
      ) : null}
    </div>
  )
}

export function TextAreaField({
  label,
  hint,
  value,
  onChange,
  rows = 3,
  placeholder,
  settingsFieldId,
}: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
  settingsFieldId?: string
}) {
  return (
    <div data-builder-settings-field={settingsFieldId}>
      <FieldLabel label={label} hint={hint} />
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  )
}

export function SelectField({
  label,
  hint,
  value,
  onChange,
  options,
}: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <FieldLabel label={label} hint={hint} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function ToggleField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5 transition hover:bg-slate-50">
      <span>
        <span className="block text-sm text-slate-700">{label}</span>
        {hint ? <span className="block text-[11px] text-slate-400">{hint}</span> : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
    </label>
  )
}

export function RadioCardGroup({
  label,
  hint,
  value,
  onChange,
  options,
}: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string; description?: string }[]
}) {
  return (
    <div>
      <FieldLabel label={label} hint={hint} />
      <div className="grid gap-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition',
              value === opt.value
                ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/30'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
            )}
          >
            <input
              type="radio"
              name={label}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="mt-1 text-blue-600 focus:ring-blue-500"
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">{opt.label}</span>
              {opt.description ? (
                <span className="block text-xs text-slate-400">{opt.description}</span>
              ) : null}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

export function ImageUrlField({
  label,
  hint,
  value,
  onChange,
  placeholder = 'https://... veya /uploads/...',
  settingsFieldId,
  uploadFolder = 'builder',
  recommendedSize,
}: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  settingsFieldId?: string
  uploadFolder?: string
  recommendedSize?: string
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const previewUrl = resolveMediaUrl(value)
  const mergedHint = [hint, recommendedSize ? `Onerilen olcu: ${recommendedSize}` : '']
    .filter(Boolean)
    .join(' | ')

  return (
    <div className="relative" data-builder-settings-field={settingsFieldId}>
      <FieldLabel label={label} hint={mergedHint} tooltip="Medya kütüphanesinden seçin veya URL girin" />
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        >
          Resim Seç
        </button>
      </div>
      {previewUrl ? (
        <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <img src={previewUrl} alt="" className="max-h-24 w-full object-contain object-left" />
        </div>
      ) : null}
      <MediaPickerModal
        open={pickerOpen}
        title={label}
        onClose={() => setPickerOpen(false)}
        onSelect={(media) => onChange(catalogMediaPickUrl(media))}
        uploadFolder={uploadFolder}
      />
    </div>
  )
}

export function AddItemButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 py-2.5 text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700"
    >
      + {children}
    </button>
  )
}

export function ManualListPlaceholder({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
      <p className="text-xs font-medium text-slate-700">{title}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{description}</p>
      <div className="mt-3 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <span className="h-8 w-8 shrink-0 rounded-md bg-slate-100" />
            <span className="h-2 flex-1 rounded bg-slate-100" />
            <span className="rounded-md border border-slate-200 px-2 py-1 text-[10px] text-slate-400">
              Seç
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
