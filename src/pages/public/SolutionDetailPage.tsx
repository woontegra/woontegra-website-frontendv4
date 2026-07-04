import { useQuery } from '@tanstack/react-query'
import { Link, Navigate, useParams } from 'react-router-dom'
import { usePreviewOrParamSlug } from '@/lib/previewRouteParams'
import { PublicBuilderBlocksPage } from '@/components/public/PublicBuilderBlocksPage'
import { SolutionDetailLayout } from '@/components/public/solutions/SolutionDetailLayout'
import { NotFoundPage } from '@/pages/public/NotFoundPage'
import { usePublicPageBlocks } from '@/hooks/usePublicPageBlocks'
import { usePageMeta } from '@/hooks/usePageMeta'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { mergeSolutionPage, type SolutionPageOverrides } from '@/lib/solutionPageMerge'
import {
  isKnownSolutionSlug,
  isRemovedSolutionSlug,
  resolveSolutionSlug,
} from '@/lib/solutionSlugs'
import { pageContentService } from '@/services/pageContentService'
import { SOLUTION_PAGE_CONTENT_KEY } from '@/data/solutionCatalog'
import { SOLUTION_DETAIL_BY_SLUG } from '@/data/solutionDetailContent'

export function normalizeSolutionPages(raw: unknown): Record<string, SolutionPageOverrides> {
  if (!raw || typeof raw !== 'object') return {}
  const row = raw as Record<string, unknown>
  if (row.pages && typeof row.pages === 'object') return row.pages as Record<string, SolutionPageOverrides>
  return row as Record<string, SolutionPageOverrides>
}

export function SolutionDetailPage() {
  const { slug: paramSlug = '' } = useParams()
  const slug = resolveSolutionSlug(usePreviewOrParamSlug(paramSlug))

  if (isRemovedSolutionSlug(slug)) {
    return <Navigate to="/cozumler" replace />
  }

  const base = SOLUTION_DETAIL_BY_SLUG[slug]
  const { blocks } = usePublicPageBlocks(SOLUTION_PAGE_CONTENT_KEY, slug)

  const { data: overrides } = useQuery({
    queryKey: ['page-content', SOLUTION_PAGE_CONTENT_KEY, slug],
    queryFn: async () => {
      const raw = await pageContentService.getRawByKey(SOLUTION_PAGE_CONTENT_KEY)
      const pages = normalizeSolutionPages(raw)
      return pages[slug] ?? null
    },
    enabled: Boolean(base),
    ...publicQueryOptions,
  })

  const content = base ? mergeSolutionPage(base, overrides ?? {}) : null
  const disabled = content?.enabled === false

  usePageMeta({
    title: content?.seoTitle ?? (base ? `${base.title} | Woontegra` : 'Çözüm'),
    description: content?.seoDescription ?? content?.description,
  })

  if (!base || !isKnownSolutionSlug(slug)) return <NotFoundPage />

  if (disabled) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Çözüm şu an yayında değil</h1>
        <Link to="/cozumler" className="mt-4 inline-block text-emerald-700 hover:underline">
          Çözümlere dön
        </Link>
      </div>
    )
  }

  return (
    <PublicBuilderBlocksPage blocks={blocks} fallback={<SolutionDetailLayout content={content!} />} />
  )
}
