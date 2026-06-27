import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { PublicBuilderBlocksPage } from '@/components/public/PublicBuilderBlocksPage'
import { ServiceDetailLayout } from '@/components/public/services/ServiceDetailLayout'
import { NotFoundPage } from '@/pages/public/NotFoundPage'
import { usePublicPageBlocks } from '@/hooks/usePublicPageBlocks'
import { usePageMeta } from '@/hooks/usePageMeta'
import { mergeServicePage, servicePageSeo, type ServicePageOverrides } from '@/lib/servicePageMerge'
import { resolveServiceSlug } from '@/lib/serviceSlugs'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { pageContentService } from '@/services/pageContentService'
import { SERVICE_PAGE_CONTENT_KEY } from '@/data/serviceCatalog'
import { SERVICE_DETAIL_BY_SLUG } from '@/data/serviceDetailContent'

export function normalizeServicePages(raw: unknown): Record<string, ServicePageOverrides> {
  if (!raw || typeof raw !== 'object') return {}
  const row = raw as Record<string, unknown>
  if (row.pages && typeof row.pages === 'object') {
    return row.pages as Record<string, ServicePageOverrides>
  }
  return row as Record<string, ServicePageOverrides>
}

export function ServiceDetailPage() {
  const { slug: rawSlug = '' } = useParams()
  const slug = resolveServiceSlug(rawSlug)
  const base = SERVICE_DETAIL_BY_SLUG[slug]
  const { blocks } = usePublicPageBlocks(SERVICE_PAGE_CONTENT_KEY, slug)

  const { data: overrides } = useQuery({
    queryKey: ['page-content', SERVICE_PAGE_CONTENT_KEY, slug],
    queryFn: async () => {
      const raw = await pageContentService.getRawByKey(SERVICE_PAGE_CONTENT_KEY)
      const pages = normalizeServicePages(raw)
      return pages[slug] ?? null
    },
    enabled: Boolean(base),
    ...publicQueryOptions,
  })

  const content = base ? mergeServicePage(base, overrides ?? {}) : null
  const disabled = overrides?.enabled === false
  const seo = base ? servicePageSeo(base, overrides ?? {}) : { title: 'Hizmet bulunamadı', description: '' }

  usePageMeta({ title: seo.title, description: seo.description })

  if (!base) return <NotFoundPage />

  if (disabled) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Hizmet şu an yayında değil</h1>
      </div>
    )
  }

  return (
    <PublicBuilderBlocksPage
      blocks={blocks}
      fallback={<ServiceDetailLayout content={content!} />}
    />
  )
}
