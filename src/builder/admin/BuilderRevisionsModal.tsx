import { formatDateTime } from '@/utils/adminOrderUi'
import type { BuilderRevisionListItemDto } from '@/types/builderPages'

type Props = {
  open: boolean
  revisions: BuilderRevisionListItemDto[]
  onClose: () => void
}

export function BuilderRevisionsModal({ open, revisions, onClose }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="Kapat" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Yayın geçmişi</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            Kapat
          </button>
        </div>
        {revisions.length === 0 ? (
          <p className="text-sm text-slate-600">Henüz yayınlanmış sürüm yok.</p>
        ) : (
          <ul className="max-h-[50vh] space-y-2 overflow-auto">
            {revisions.map((row) => (
              <li key={row.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <p className="font-medium text-slate-900">Sürüm {row.revision}</p>
                <p className="text-xs text-slate-500">{formatDateTime(row.createdAt)}</p>
                {row.createdByEmail ? (
                  <p className="text-xs text-slate-500">{row.createdByEmail}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
