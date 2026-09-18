import { Link, Navigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PublicBuilderBlocksPage } from '@/components/public/PublicBuilderBlocksPage'
import { BhModulePageProvider } from '@/components/public/product/BhModulePageProvider'
import { NotFoundPage } from '@/pages/public/NotFoundPage'
import { usePublicPageBlocks } from '@/hooks/usePublicPageBlocks'
import { usePageMeta } from '@/hooks/usePageMeta'
import { usePreviewOrParamSlug } from '@/lib/previewRouteParams'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { pageContentService } from '@/services/pageContentService'
import {
  BH_MODULE_PAGES_CONTENT_KEY,
  bhModuleDetailPath,
  getBhModulePageFromRaw,
  resolveBhModuleCanonicalSlug,
} from '@/builder/types/bhModule'

/**
 * Tek dinamik BH modül detay renderer — içerik yalnızca CMS (bhModulePages) bloklarından gelir.
 */
export function BhModuleDetailPage() {
  const { slug: paramSlug = '' } = useParams()
  const rawSlug = usePreviewOrParamSlug(paramSlug)
  const slug = resolveBhModuleCanonicalSlug(rawSlug)
  const needsAliasRedirect = Boolean(rawSlug && slug && rawSlug !== slug)

  const { blocks, isPending: blocksPending } = usePublicPageBlocks(
    BH_MODULE_PAGES_CONTENT_KEY,
    needsAliasRedirect ? '' : slug,
  )

  const { data: pageRow, isPending: metaPending } = useQuery({
    queryKey: ['page-content', BH_MODULE_PAGES_CONTENT_KEY, 'meta', slug],
    queryFn: async () => {
      const raw = await pageContentService.getRawByKey(BH_MODULE_PAGES_CONTENT_KEY)
      return getBhModulePageFromRaw(raw, slug)
    },
    enabled: Boolean(slug) && !needsAliasRedirect,
    ...publicQueryOptions,
  })

  const catalog = pageRow

  usePageMeta({
    title: catalog?.seoTitle || catalog?.title || 'Bilirkişi Hesap Modülü',
    description: catalog?.seoDescription || catalog?.shortDescription,
    canonicalPath: slug ? bhModuleDetailPath(slug) : undefined,
  })

  if (needsAliasRedirect) {
    return <Navigate to={bhModuleDetailPath(slug)} replace />
  }

  if (!slug) return <NotFoundPage />

  if (blocksPending || metaPending) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <div className="h-10 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="mt-4 h-40 animate-pulse rounded bg-slate-100" />
      </div>
    )
  }

  if (!catalog || catalog.published === false) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Modül bulunamadı</h1>
        <Link
          to="/yazilimlar/bilirkisi-hesap#hesaplama-modulleri"
          className="mt-4 inline-block text-emerald-700 hover:underline"
        >
          Modüllere dön
        </Link>
      </div>
    )
  }

  const fallback = (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="text-sm text-slate-500">Bu modül için henüz builder içeriği yok.</p>
      <Link
        to="/yazilimlar/bilirkisi-hesap#hesaplama-modulleri"
        className="mt-4 inline-block text-emerald-700 hover:underline"
      >
        Modüllere dön
      </Link>
    </div>
  )

  return (
    <BhModulePageProvider moduleTitle={catalog.title}>
      <PublicBuilderBlocksPage blocks={blocks} fallback={fallback} deferBelowFold={false} />
    </BhModulePageProvider>
  )
}
