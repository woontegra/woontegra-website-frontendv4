import { PAGE_TEMPLATE_CARDS } from '@/builder/admin/blockLibraryConfig'
import { cn } from '@/lib/cn'

type Props = {
  open: boolean
  onClose: () => void
}

export function PageTemplatesModal({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="Kapat" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Yeni Sayfa</h2>
            <p className="mt-1 text-sm text-slate-500">
              Hazır şablonlar — içerik oluşturma sonraki aşamada bağlanacak.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            Kapat
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PAGE_TEMPLATE_CARDS.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={onClose}
              className={cn(
                'rounded-xl border border-slate-200 p-4 text-left transition',
                'hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-sm',
                tpl.id === 'blank' && 'ring-1 ring-blue-500/30 border-blue-200 bg-blue-50/30',
              )}
            >
              <p className="text-sm font-semibold text-slate-900">{tpl.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{tpl.description}</p>
              <p className="mt-3 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Yakında aktif
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
