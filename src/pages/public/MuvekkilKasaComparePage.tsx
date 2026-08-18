import { PublicBuilderBlocksPage } from '@/components/public/PublicBuilderBlocksPage'
import { MuvekkilKasaCompareView } from '@/components/public/muvekkil-kasa/MuvekkilKasaCompareView'
import { MkComparePageProvider } from '@/components/public/muvekkil-kasa/MkComparePageProvider'
import { MK_COMPARE_PATH, MK_COMPARE_SLUG } from '@/components/public/muvekkil-kasa/comparePageUtils'
import { usePageMeta } from '@/hooks/usePageMeta'
import { usePublicPageBlocks } from '@/hooks/usePublicPageBlocks'
import { PRODUCT_PAGES_CONTENT_KEY } from '@/lib/builderPageContentKeys'
import { resolveMkComparePublicBlocks } from '@/builder/templates/mkCompareBuilderTemplate'

export function MuvekkilKasaComparePage() {
  usePageMeta({
    title: 'Müvekkil Kasa Defteri Masaüstü ve SaaS Karşılaştırması | Woontegra',
    description:
      'Müvekkil Kasa Defteri masaüstü ve web tabanlı SaaS sürümlerini karşılaştırın; büronuza uygun kullanım, lisans ve özellik seçeneğini belirleyin.',
    canonicalPath: MK_COMPARE_PATH,
  })

  const { blocks } = usePublicPageBlocks(PRODUCT_PAGES_CONTENT_KEY, MK_COMPARE_SLUG)
  const publishedBlocks = resolveMkComparePublicBlocks(blocks)

  return (
    <MkComparePageProvider>
      <PublicBuilderBlocksPage
        blocks={publishedBlocks}
        fallback={<MuvekkilKasaCompareView />}
        className="overflow-x-hidden bg-white"
      />
    </MkComparePageProvider>
  )
}
