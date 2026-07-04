import { useQuery } from '@tanstack/react-query'
import { PageShell } from '@/components/public/PageShell'
import { usePageMeta } from '@/hooks/usePageMeta'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { resolvePublicLegalHtml } from '@/lib/legalDocumentContent'
import { legalDocumentsService } from '@/services/legalDocumentsService'
import type { LegalDocType } from '@/types/legalDocuments'
import { getErrorMessage } from '@/api/client'

type Props = {
  docType: LegalDocType
  title: string
  subtitle: string
  seoTitle: string
  seoDescription: string
  breadcrumbs: { label: string; href?: string }[]
}

export function LegalDocumentView({
  docType,
  title: fallbackTitle,
  subtitle,
  seoTitle,
  seoDescription,
  breadcrumbs,
}: Props) {
  const { data, isError, error } = useQuery({
    queryKey: ['legal-document', docType],
    queryFn: () => legalDocumentsService.preview(docType),
    ...publicQueryOptions,
  })

  usePageMeta({ title: seoTitle, description: seoDescription })

  const title = data?.title?.trim() || fallbackTitle
  const html = resolvePublicLegalHtml(docType, data?.content)

  return (
    <PageShell breadcrumbs={breadcrumbs} title={title} description={subtitle} maxWidth="3xl">
      {isError ? (
        <p className="mb-4 text-sm text-amber-700" role="status">
          Güncel metin yüklenemedi; varsayılan içerik gösteriliyor. ({getErrorMessage(error, 'API hatası')})
        </p>
      ) : null}
      <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      {data?.version ? <p className="mt-8 text-xs text-slate-500">Sürüm {data.version}</p> : null}
    </PageShell>
  )
}
