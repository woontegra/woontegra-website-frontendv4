import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { LoadingState } from '@/components/public/LoadingState'
import { PageBlocksRenderer } from '@/builder/render/PageBlocksRenderer'
import {
  getBuilderPageDefinition,
  resolveBuilderPageKey,
} from '@/builder/pages/builderPageRegistry'
import { extractBlocksForPage } from '@/builder/load/pageContentPersistence'
import { pageContentService } from '@/services/pageContentService'
import { publicQueryOptions } from '@/lib/publicQueryOptions'

/** Kaydedilmiş API JSON'undan builder önizlemesi — store kullanmaz */
export function BuilderSavedPreviewPage() {
  const [params] = useSearchParams()
  const pageKey = resolveBuilderPageKey(params.get('page'))
  const def = getBuilderPageDefinition(pageKey)

  const { data: raw, isPending, isError } = useQuery({
    queryKey: ['builder-saved-preview', def?.contentKey, def?.slug],
    queryFn: () => pageContentService.getRawByKey(def!.contentKey),
    enabled: Boolean(def),
    ...publicQueryOptions,
  })

  const blocks = useMemo(() => {
    if (!def || !raw) return null
    return extractBlocksForPage(raw, def)
  }, [def, raw])

  if (!def) {
    return <p className="p-8 text-slate-600">Geçersiz sayfa.</p>
  }

  if (isPending) return <LoadingState />

  if (isError || !blocks?.length) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <h1 className="text-lg font-semibold text-slate-900">Kayıtlı builder içeriği yok</h1>
        <p className="mt-2 text-sm text-slate-600">
          Önce builder&apos;da düzenleyip <strong>Kaydet</strong> ile API&apos;ye yazın, ardından önizleyin.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800">
        Kaydedilmiş içerik önizlemesi — {def.title}
      </div>
      <PageBlocksRenderer blocks={blocks} mode="public" />
    </div>
  )
}
