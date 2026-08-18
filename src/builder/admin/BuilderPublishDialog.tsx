import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'

type Props = {
  open: boolean
  dirty: boolean
  loading: boolean
  hasSavedDraft: boolean
  onCancel: () => void
  onPublishSaved: () => void
  onSaveAndPublish: () => void
}

export function BuilderPublishDialog({
  open,
  dirty,
  loading,
  hasSavedDraft,
  onCancel,
  onPublishSaved,
  onSaveAndPublish,
}: Props) {
  if (!open) return null

  if (!dirty) {
    return (
      <ConfirmDialog
        open={open}
        title="Hakkımızda sayfasını yayına al"
        description="Bu işlem canlı Hakkımızda sayfasını kaydedilmiş taslakla değiştirir. Devam edilsin mi?"
        confirmLabel="Yayına al"
        loading={loading}
        onCancel={onCancel}
        onConfirm={onPublishSaved}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="builder-publish-title"
      >
        <h3 id="builder-publish-title" className="text-base font-semibold text-slate-900">
          Kaydedilmemiş değişiklikler
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Yayına yalnızca en son kaydedilmiş taslak alınacaktır. Bu işlem canlı Hakkımızda sayfasını değiştirir.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            İptal
          </Button>
          {hasSavedDraft ? (
            <Button variant="secondary" onClick={onPublishSaved} disabled={loading}>
              Kayıtlı taslağı yayınla
            </Button>
          ) : null}
          <Button onClick={onSaveAndPublish} disabled={loading}>
            {loading ? 'İşleniyor…' : 'Önce kaydet, sonra yayınla'}
          </Button>
        </div>
      </div>
    </div>
  )
}
