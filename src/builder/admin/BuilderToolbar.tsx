import { Link, useSearchParams } from 'react-router-dom'
import { BUILDER_PAGE_GROUPS, useBuilderStore } from '@/builder/store/builderStore'
import { cn } from '@/lib/cn'

type Props = {
  onJsonOpen: () => void
  onValidationOpen: () => void
  onTemplatesOpen: () => void
}

function formatSavedAt(iso: string | null): string {
  if (!iso) return 'Henüz kaydedilmedi'
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

const SOURCE_LABELS = {
  'builder-json': 'Builder JSON',
  'builder-draft': 'Builder taslağı',
  'legacy-public': 'Legacy (salt okunur)',
} as const

export function BuilderToolbar({ onJsonOpen, onValidationOpen, onTemplatesOpen }: Props) {
  const [, setSearchParams] = useSearchParams()
  const pageKey = useBuilderStore((s) => s.pageKey)
  const isDirty = useBuilderStore((s) => s.isDirty)
  const lastSavedAt = useBuilderStore((s) => s.lastSavedAt)
  const canUndo = useBuilderStore((s) => s.canUndo)
  const canRedo = useBuilderStore((s) => s.canRedo)
  const loadPageStatus = useBuilderStore((s) => s.loadPageStatus)
  const pageLoadSource = useBuilderStore((s) => s.pageLoadSource)
  const canvasMode = useBuilderStore((s) => s.canvasMode)
  const blocks = useBuilderStore((s) => s.blocks)
  const convertToBuilderDraft = useBuilderStore((s) => s.convertToBuilderDraft)
  const revertToLegacyView = useBuilderStore((s) => s.revertToLegacyView)
  const saveDraftLocal = useBuilderStore((s) => s.saveDraftLocal)
  const savePageToApi = useBuilderStore((s) => s.savePageToApi)
  const isSaving = useBuilderStore((s) => s.isSaving)
  const undo = useBuilderStore((s) => s.undo)
  const redo = useBuilderStore((s) => s.redo)
  const loadPage = useBuilderStore((s) => s.loadPage)

  const handlePageChange = (key: string) => {
    if (key === pageKey) return
    if (isDirty && !window.confirm('Kaydedilmemiş değişiklikler kaybolabilir. Devam edilsin mi?')) {
      return
    }
    setSearchParams({ page: key }, { replace: true })
    void loadPage(key)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-3 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            to="/admin"
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            ← Geri
          </Link>
          <div className="hidden h-5 w-px bg-slate-200 sm:block" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">Page Builder</p>
            <p className="truncate text-[11px] text-slate-400">Woontegra · Visual Editor</p>
          </div>
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          {canvasMode === 'legacy-public' ? (
            <ToolbarBtn onClick={convertToBuilderDraft} variant="primary">
              Builder&apos;a dönüştür
            </ToolbarBtn>
          ) : (
            <>
              <ToolbarBtn onClick={() => void savePageToApi()} variant="primary" disabled={isSaving || blocks.length === 0}>
                {isSaving ? 'Kaydediliyor…' : 'Kaydet'}
              </ToolbarBtn>
              <ToolbarBtn onClick={() => saveDraftLocal()} disabled={isSaving}>
                Taslak (local)
              </ToolbarBtn>
              <ToolbarBtn onClick={revertToLegacyView}>Legacy görünüme dön</ToolbarBtn>
            </>
          )}
          <ToolbarBtn onClick={onTemplatesOpen}>Taslak</ToolbarBtn>
          <ToolbarBtn onClick={onJsonOpen}>JSON</ToolbarBtn>
          <ToolbarBtn onClick={undo} disabled={!canUndo}>
            Undo
          </ToolbarBtn>
          <ToolbarBtn onClick={redo} disabled={!canRedo}>
            Redo
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => {
              const url = `/admin/builder-preview?page=${encodeURIComponent(pageKey)}`
              window.open(url, '_blank', 'noopener,noreferrer')
            }}
            disabled={loadPageStatus === 'loading'}
          >
            Önizle
          </ToolbarBtn>
          <ToolbarBtn onClick={onValidationOpen}>Yayın Kontrolü</ToolbarBtn>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-2 sm:border-t-0 sm:pt-0">
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <span className="text-slate-400">Sayfa</span>
            <select
              value={pageKey}
              onChange={(e) => handlePageChange(e.target.value)}
              disabled={loadPageStatus === 'loading'}
              className="max-w-[220px] rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 disabled:opacity-50"
            >
              {BUILDER_PAGE_GROUPS.map((group) => (
                <optgroup key={group.id} label={group.label}>
                  {group.pages.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <div className="text-right text-[11px] leading-tight text-slate-500">
            <p className="flex flex-wrap items-center justify-end gap-1.5">
              <span
                className={cn(
                  'inline-flex rounded-full px-2 py-0.5 font-medium',
                  isDirty ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700',
                )}
              >
                {loadPageStatus === 'loading'
                  ? 'Yükleniyor…'
                  : isDirty
                    ? 'Kaydedilmemiş değişiklik'
                    : lastSavedAt
                      ? 'Kaydedildi'
                      : 'Hazır'}
              </span>
              {pageLoadSource ? (
                <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                  {SOURCE_LABELS[pageLoadSource]}
                </span>
              ) : null}
            </p>
            <p className="mt-0.5 text-slate-400">Son kayıt: {formatSavedAt(lastSavedAt)}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

function ToolbarBtn({
  children,
  onClick,
  disabled,
  variant,
  title,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary'
  title?: string
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition',
        variant === 'primary'
          ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40',
      )}
    >
      {children}
    </button>
  )
}
