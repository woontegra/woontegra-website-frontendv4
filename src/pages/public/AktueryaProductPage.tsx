import { AktueryaProductView } from '@/components/public/aktuerya/AktueryaProductView'
import { SoftwareProductJsonLd } from '@/components/seo/SoftwareProductJsonLd'
import { AKTUERYA_NAME, AKTUERYA_PATH, AKTUERYA_SEO } from '@/data/aktueryaProduct'
import { usePageMeta } from '@/hooks/usePageMeta'

export function AktueryaProductPage() {
  usePageMeta({
    title: AKTUERYA_SEO.title,
    description: AKTUERYA_SEO.description,
    canonicalPath: AKTUERYA_PATH,
    ogType: 'product',
  })

  return (
    <>
      <SoftwareProductJsonLd
        name={AKTUERYA_NAME}
        description={AKTUERYA_SEO.description}
        path={AKTUERYA_PATH}
        applicationCategory="BusinessApplication"
        operatingSystem="Web, Windows, macOS"
        includeOffer={false}
        breadcrumbs={[
          { name: 'Ana Sayfa', path: '/' },
          { name: 'Yazılımlar', path: '/yazilimlar' },
          { name: AKTUERYA_NAME, path: AKTUERYA_PATH },
        ]}
      />
      <AktueryaProductView />
    </>
  )
}
