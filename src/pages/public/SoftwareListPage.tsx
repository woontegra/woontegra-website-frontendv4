import { PageHero } from '@/components/public/PageHero'
import { PublicBuilderBlocksPage } from '@/components/public/PublicBuilderBlocksPage'
import { HomeSoftwarePicker } from '@/components/public/home/HomeSoftwarePicker'
import { SiteCtaSection } from '@/components/public/SiteCtaSection'
import { usePageMeta } from '@/hooks/usePageMeta'
import { mergePageSeo } from '@/lib/siteSeo'
import { usePublicPageBlocks } from '@/hooks/usePublicPageBlocks'
import { SOFTWARE_PAGE_CONTENT_KEY } from '@/lib/builderPageContentKeys'

/**
 * Yazılımlar sayfası: ana sayfadaki "Ne yapmak istiyorsunuz?" seçicisiyle aynı yapı.
 * Her ürünün kendi sayfasına bağlantı verir.
 */
export function SoftwareListPage() {
  const { blocks } = usePublicPageBlocks(SOFTWARE_PAGE_CONTENT_KEY)

  usePageMeta({ ...mergePageSeo('/yazilimlar'), canonicalPath: '/yazilimlar' })

  const legacyView = (
    <div>
      <PageHero
        eyebrow="Yazılımlar"
        title="Dijital Ürünler ve Yazılımlar"
        description="Woontegra’nın geliştirdiği Bilirkişi Hesap, Müvekkil Kasa Defteri, KoopPlus, Avukat Siteleri ve Şifre Kasası yazılımlarına buradan ulaşın."
        breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Yazılımlar' }]}
      />
      <HomeSoftwarePicker followsPageTitle />
      <SiteCtaSection
        title="Hangi programın size uygun olduğundan emin değil misiniz?"
        description="Bizi arayın ya da yazın; işinize uygun programı birlikte seçelim."
        buttonText="İletişime geçin"
        buttonLink="/iletisim"
      />
    </div>
  )

  return <PublicBuilderBlocksPage blocks={blocks} fallback={legacyView} />
}
