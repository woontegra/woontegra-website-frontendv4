import { useQuery } from '@tanstack/react-query'
import { SoftwareDetailView } from '@/components/public/product/SoftwareDetailView'
import { LoadingState } from '@/components/public/LoadingState'
import { ErrorState } from '@/components/public/ErrorState'
import { usePageMeta } from '@/hooks/usePageMeta'
import { Link, useParams } from 'react-router-dom'
import { usePreviewOrParamSlug } from '@/lib/previewRouteParams'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { productsService } from '@/services/productsService'
import { getErrorMessage } from '@/api/client'

export function SoftwareDetailPage() {
  const { slug: paramSlug = '' } = useParams()
  const slug = usePreviewOrParamSlug(paramSlug)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['products', slug],
    queryFn: () => productsService.getBySlug(slug),
    enabled: Boolean(slug),
    ...publicQueryOptions,
  })

  usePageMeta({
    title: data?.seoTitle || data?.name || 'Yazılım',
    description: data?.seoDescription || data?.shortDescription,
  })

  if (isPending) return <LoadingState />
  if (isError || !data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <ErrorState message={getErrorMessage(error, 'Yazılım bulunamadı')} />
        <Link to="/yazilimlar" className="mt-6 inline-block text-emerald-700 hover:underline">
          Yazılımlara dön
        </Link>
      </div>
    )
  }

  return <SoftwareDetailView product={data} />
}
