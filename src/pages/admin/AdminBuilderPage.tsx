import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BlockLibraryPanel } from '@/builder/admin/BlockLibraryPanel'
import { BlockSettingsPanel } from '@/builder/admin/BlockSettingsPanel'
import { BuilderPreviewCanvas } from '@/builder/admin/BuilderPreviewCanvas'
import { BuilderToolbar } from '@/builder/admin/BuilderToolbar'
import { PageTemplatesModal } from '@/builder/admin/PageTemplatesModal'
import { resolveBuilderPageKey } from '@/builder/pages/builderPageRegistry'
import { useBuilderStore } from '@/builder/store/builderStore'
import { validateBlocksForPublish } from '@/builder/validation/publishValidation'
import { AppToast } from '@/components/ui/AppToast'

export function AdminBuilderPage() {
  const [searchParams] = useSearchParams()
  const pageParam = resolveBuilderPageKey(searchParams.get('page'))

  const loadPage = useBuilderStore((s) => s.loadPage)
  const exportJson = useBuilderStore((s) => s.exportJson)
  const blocks = useBuilderStore((s) => s.blocks)

  const [jsonOpen, setJsonOpen] = useState(false)
  const [validationOpen, setValidationOpen] = useState(false)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [validationResult, setValidationResult] = useState(() => validateBlocksForPublish(blocks))

  useEffect(() => {
    void loadPage(pageParam)
  }, [loadPage, pageParam])

  const openValidation = () => {
    setValidationResult(validateBlocksForPublish(blocks))
    setValidationOpen(true)
  }

  return (
    <div className="-m-6 flex min-h-[calc(100vh)] flex-col bg-[#f4f6f9] lg:h-[calc(100vh)] lg:max-h-[calc(100vh)] lg:overflow-hidden">
      <BuilderToolbar
        onJsonOpen={() => setJsonOpen(true)}
        onValidationOpen={openValidation}
        onTemplatesOpen={() => setTemplatesOpen(true)}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <BlockLibraryPanel />
        <BuilderPreviewCanvas />
        <BlockSettingsPanel />
      </div>

      <PageTemplatesModal open={templatesOpen} onClose={() => setTemplatesOpen(false)} />

      {jsonOpen ? (
        <Modal title="JSON önizleme" onClose={() => setJsonOpen(false)}>
          <pre className="max-h-[60vh] overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-emerald-100">
            {exportJson()}
          </pre>
          <p className="mt-2 text-xs text-slate-500">
            Kaydet ile API&apos;ye yazılacak JSON yapısı. Gerçek kayıt PUT /api/page-content/:contentKey üzerinden yapılır.
          </p>
        </Modal>
      ) : null}

      {validationOpen ? (
        <Modal title="Yayın kontrolü" onClose={() => setValidationOpen(false)}>
          {validationResult.ok ? (
            <p className="text-sm text-emerald-700">Yayına hazır görünüyor — kritik eksik bulunamadı.</p>
          ) : (
            <ul className="space-y-2">
              {validationResult.issues.map((issue, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
                >
                  {issue.blockId ? (
                    <span className="font-mono text-xs text-amber-700">{issue.blockId}: </span>
                  ) : null}
                  {issue.message}
                </li>
              ))}
            </ul>
          )}
        </Modal>
      ) : null}

      <AppToast />
    </div>
  )
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="Kapat" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            Kapat
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
