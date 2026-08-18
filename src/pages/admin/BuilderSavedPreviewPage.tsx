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
import { adminBuilderPagesService } from '@/services/adminBuilderPagesService'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { MkSaasBuilderPreviewProvider } from '@/components/public/product/MkSaasProductPageProvider'
import { MkComparePageProvider } from '@/components/public/muvekkil-kasa/MkComparePageProvider'
import { isMkSaasBuilderPageKey } from '@/lib/muvekkilKasaSaasProduct'
import { isMkCompareBuilderPageKey } from '@/components/public/muvekkil-kasa/comparePageUtils'
import { resolveMkComparePublicBlocks } from '@/builder/templates/mkCompareBuilderTemplate'
import { resolveBuilderPreviewDataSource } from '@/builder/pilot/aboutBuilderPilot'
import { sanitizeAboutBuilderBlocks } from '@/builder/templates/aboutEditableTemplate'

/** Kaydedilmiş API JSON'undan builder önizlemesi — store kullanmaz */
export function BuilderSavedPreviewPage() {
  const [params] = useSearchParams()
  const pageKey = resolveBuilderPageKey(params.get('page'))
  const def = getBuilderPageDefinition(pageKey)
  const isAboutPilot = resolveBuilderPreviewDataSource(pageKey) === 'admin-builder-draft'

  const publicPreview = useQuery({
    queryKey: ['builder-saved-preview', def?.contentKey, def?.slug],
    queryFn: () => pageContentService.getRawByKey(def!.contentKey),
    enabled: Boolean(def) && !isAboutPilot,
    ...publicQueryOptions,
  })

  const aboutPreview = useQuery({
    queryKey: ['builder-about-draft-preview', 'about'],
    queryFn: () => adminBuilderPagesService.getState('about'),
    enabled: Boolean(def) && isAboutPilot,
  })

  const blocks = useMemo(() => {
    if (!def) return null
    if (isAboutPilot) {
      const state = aboutPreview.data
      if (!state?.hasBuilderRecord) return null
      const extracted = extractBlocksForPage(state.draftContent, def)
      return extracted ? sanitizeAboutBuilderBlocks(extracted) : extracted
    }
    const raw = publicPreview.data
    if (!raw) return null
    const extracted = extractBlocksForPage(raw, def)
    if (isMkCompareBuilderPageKey(pageKey)) {
      return resolveMkComparePublicBlocks(extracted)
    }
    return extracted
  }, [def, isAboutPilot, aboutPreview.data, publicPreview.data, pageKey])

  if (!def) {
    return <p className="p-8 text-slate-600">Geçersiz sayfa.</p>
  }

  const isPending = isAboutPilot ? aboutPreview.isPending : publicPreview.isPending
  const isError = isAboutPilot ? aboutPreview.isError : publicPreview.isError

  if (isPending) return <LoadingState />

  if (isAboutPilot && !aboutPreview.data?.hasBuilderRecord) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <h1 className="text-lg font-semibold text-slate-900">Kayıtlı taslak yok</h1>
        <p className="mt-2 text-sm text-slate-600">Önizleme için önce taslağı kaydedin.</p>
      </div>
    )
  }

  if (isError || !blocks?.length) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <h1 className="text-lg font-semibold text-slate-900">
          {isAboutPilot ? 'Kayıtlı taslak içeriği yok' : 'Kayıtlı builder içeriği yok'}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {isAboutPilot
            ? 'Önce taslağı kaydedin, ardından önizleyin.'
            : "Önce builder'da düzenleyip Kaydet ile API'ye yazın, ardından önizleyin."}
        </p>
      </div>
    )
  }

  const needsCompareProvider =
    isMkCompareBuilderPageKey(pageKey) ||
    blocks.some(
      (b) =>
        b.type === 'mk-compare-table' ||
        b.type === 'mk-compare-details' ||
        (b.type === 'mk-saas-purchase' && (b as { settings?: { layout?: string } }).settings?.layout === 'compare'),
    )
  const needsMkProvider =
    isMkSaasBuilderPageKey(pageKey) ||
    blocks.some((b) => b.type === 'mk-saas-purchase' || b.type === 'whatsapp-guide')

  const preview = (
    <div className="min-h-screen bg-white">
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800">
        {isAboutPilot ? `Taslak Önizleme — ${def.title}` : `Kaydedilmiş içerik önizlemesi — ${def.title}`}
      </div>
      <PageBlocksRenderer blocks={blocks} mode="preview" />
    </div>
  )

  if (needsCompareProvider) {
    return <MkComparePageProvider previewSafe>{preview}</MkComparePageProvider>
  }
  return needsMkProvider ? <MkSaasBuilderPreviewProvider>{preview}</MkSaasBuilderPreviewProvider> : preview
}
