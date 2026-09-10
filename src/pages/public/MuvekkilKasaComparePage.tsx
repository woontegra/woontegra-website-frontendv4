import { PublicBuilderBlocksPage } from '@/components/public/PublicBuilderBlocksPage'
import { MuvekkilKasaCompareView } from '@/components/public/muvekkil-kasa/MuvekkilKasaCompareView'
import { MkComparePageProvider } from '@/components/public/muvekkil-kasa/MkComparePageProvider'
import { MK_COMPARE_PATH, MK_COMPARE_SLUG } from '@/components/public/muvekkil-kasa/comparePageUtils'
import { SoftwareProductJsonLd } from '@/components/seo/SoftwareProductJsonLd'
import { usePageMeta } from '@/hooks/usePageMeta'
import { usePublicPageBlocks } from '@/hooks/usePublicPageBlocks'
import { PRODUCT_PAGES_CONTENT_KEY } from '@/lib/builderPageContentKeys'
import { resolveMkComparePublicBlocks } from '@/builder/templates/mkCompareBuilderTemplate'

const MK_TITLE = 'Müvekkil Kasa Defteri Masaüstü ve Web Tabanlı Karşılaştırması | Woontegra'
const MK_DESCRIPTION =
  'Müvekkil Kasa Defteri masaüstü ve web tabanlı sürümlerini karşılaştırın; büronuza uygun kullanım ve özellik seçeneğini belirleyin.'

export function MuvekkilKasaComparePage() {
  usePageMeta({
    title: MK_TITLE,
    description: MK_DESCRIPTION,
    canonicalPath: MK_COMPARE_PATH,
    ogType: 'product',
  })

  const { blocks } = usePublicPageBlocks(PRODUCT_PAGES_CONTENT_KEY, MK_COMPARE_SLUG)
  const publishedBlocks = resolveMkComparePublicBlocks(blocks)

  return (
    <MkComparePageProvider>
      <SoftwareProductJsonLd
        name="Müvekkil Kasa Defteri"
        description={MK_DESCRIPTION}
        path={MK_COMPARE_PATH}
        applicationCategory="BusinessApplication"
        operatingSystem="Windows, Web"
        breadcrumbs={[
          { name: 'Ana Sayfa', path: '/' },
          { name: 'Yazılımlar', path: '/yazilimlar' },
          { name: 'Müvekkil Kasa Defteri', path: MK_COMPARE_PATH },
        ]}
      />
      <PublicBuilderBlocksPage
        blocks={publishedBlocks}
        fallback={<MuvekkilKasaCompareView />}
        className="overflow-x-hidden bg-white"
      />
    </MkComparePageProvider>
  )
}
