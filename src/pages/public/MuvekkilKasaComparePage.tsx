import { PublicBuilderBlocksPage } from '@/components/public/PublicBuilderBlocksPage'
import { MuvekkilKasaCompareView } from '@/components/public/muvekkil-kasa/MuvekkilKasaCompareView'
import { MkComparePageProvider } from '@/components/public/muvekkil-kasa/MkComparePageProvider'
import { MK_COMPARE_PATH, MK_COMPARE_SLUG } from '@/components/public/muvekkil-kasa/comparePageUtils'
import { SoftwareProductJsonLd } from '@/components/seo/SoftwareProductJsonLd'
import { usePageMeta } from '@/hooks/usePageMeta'
import { usePublicPageBlocks } from '@/hooks/usePublicPageBlocks'
import { PRODUCT_PAGES_CONTENT_KEY } from '@/lib/builderPageContentKeys'
import { resolveMkComparePublicBlocks } from '@/builder/templates/mkCompareBuilderTemplate'
import { PageBlocksRenderer } from '@/builder/render/PageBlocksRenderer'
import type { BuilderBlock } from '@/builder/types'
import { MkShowcaseMobile, MkShowcaseTour, MkShowcaseTrial } from '@/components/public/muvekkil-kasa/MuvekkilKasaShowcase'

const MK_TITLE = 'Müvekkil Kasa Defteri — Web Tabanlı Müvekkil Kasa Takibi | Woontegra'
const MK_DESCRIPTION =
  'Woontegra Müvekkil Kasa Defteri: kurulum gerektirmeden tarayıcıdan erişilen, çok kullanıcılı ve WhatsApp destekli müvekkil kasa takibi. 7 gün ücretsiz deneyin.'

/**
 * Yeni tanıtım bölümleri (ekran turu, mobil uygulama) bu eski metin bölümlerinin yerini aldı.
 * Bloklar Page Builder'da duruyor; yalnızca sitede gösterilmiyor.
 */
const MK_REPLACED_BLOCK_IDS = new Set([
  'mk-compare-details',
  'mk-compare-problem',
  'mk-compare-benefits',
  'mk-compare-file-vault',
  'mk-compare-installments',
  'mk-compare-features',
  'mk-compare-footer-cta',
])

/** Sayfa sırası: üst bölüm → ekran turu → WhatsApp rehberi → mobil uygulama → kalan bloklar → ücretsiz deneme. */
function MkComparePageSections({ blocks }: { blocks: BuilderBlock[] }) {
  const visible = blocks.filter((b) => !MK_REPLACED_BLOCK_IDS.has(b.id))
  const heroBlocks = visible.filter((b) => b.type === 'hero')
  const whatsappBlocks = visible.filter((b) => b.type === 'whatsapp-guide')
  const restBlocks = visible.filter((b) => b.type !== 'hero' && b.type !== 'whatsapp-guide')

  return (
    <div className="overflow-x-hidden bg-white">
      <PageBlocksRenderer blocks={heroBlocks} mode="public" deferBelowFold={false} />
      <MkShowcaseTour />
      {whatsappBlocks.length > 0 ? <PageBlocksRenderer blocks={whatsappBlocks} mode="public" deferBelowFold={false} /> : null}
      <MkShowcaseMobile />
      {restBlocks.length > 0 ? <PageBlocksRenderer blocks={restBlocks} mode="public" deferBelowFold={false} /> : null}
      <MkShowcaseTrial />
    </div>
  )
}

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
    <MkComparePageProvider blocks={publishedBlocks}>
      <SoftwareProductJsonLd
        name="Müvekkil Kasa Defteri"
        description={MK_DESCRIPTION}
        path={MK_COMPARE_PATH}
        applicationCategory="BusinessApplication"
        operatingSystem="Web"
        breadcrumbs={[
          { name: 'Ana Sayfa', path: '/' },
          { name: 'Yazılımlar', path: '/yazilimlar' },
          { name: 'Müvekkil Kasa Defteri', path: MK_COMPARE_PATH },
        ]}
      />
      {publishedBlocks && publishedBlocks.length > 0 ? (
        <MkComparePageSections blocks={publishedBlocks} />
      ) : (
        <PublicBuilderBlocksPage blocks={null} fallback={<MuvekkilKasaCompareView />} />
      )}
    </MkComparePageProvider>
  )
}
