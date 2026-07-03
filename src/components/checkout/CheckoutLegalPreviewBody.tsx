import { useEffect, useMemo, useState } from 'react'
import { legalDocumentsService } from '@/services/legalDocumentsService'
import type { LegalDocType } from '@/types/legalDocuments'

type Props = {
  type: LegalDocType
  variant?: 'DOWNLOAD' | 'SAAS'
  variables: Record<string, string>
}

/** Checkout yasal önizleme gövdesi — siparişe özel değişkenlerle backend'den render edilir. */
export function CheckoutLegalPreviewBody({ type, variant, variables }: Props) {
  const [html, setHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const varsKey = useMemo(() => JSON.stringify(variables), [variables])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    void legalDocumentsService
      .preview(type, variant, variables)
      .then((doc) => {
        if (cancelled) return
        setHtml(doc?.content ?? null)
      })
      .catch(() => {
        if (cancelled) return
        setError(true)
        setHtml(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, variant, varsKey])

  if (loading) {
    return <p className="text-sm text-slate-600">Yasal metin yükleniyor…</p>
  }
  if (error || !html) {
    return (
      <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-800">
        Yasal metin yüklenemedi. Lütfen sayfayı yenileyin veya destek ile iletişime geçin.
      </p>
    )
  }

  return (
    <div
      className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-800 [&_.legal-buyer-block]:my-4 [&_.legal-buyer-block]:rounded-lg [&_.legal-buyer-block]:border [&_.legal-buyer-block]:border-slate-200 [&_.legal-buyer-block]:bg-slate-50 [&_.legal-buyer-block]:p-3 [&_.legal-product-block]:my-3 [&_.legal-product-block]:rounded-lg [&_.legal-product-block]:border [&_.legal-product-block]:border-slate-200 [&_.legal-product-block]:bg-slate-50/60 [&_.legal-product-block]:p-3"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
