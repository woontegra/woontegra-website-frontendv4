import { useQuery } from '@tanstack/react-query'
import { PageBlocksRenderer } from '@/builder/render/PageBlocksRenderer'
import { PageHero } from '@/components/public/PageHero'
import { ContactPageBody } from '@/components/public/contact/ContactPageBody'
import { usePageMeta } from '@/hooks/usePageMeta'
import { usePublicPageBlocks } from '@/hooks/usePublicPageBlocks'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { pageContentService } from '@/services/pageContentService'
import { defaultContactContent } from '@/types/pageContent'
import { PAGE_CONTENT_KEYS } from '@/types/pageContent'

export function ContactPage() {
  const { blocks } = usePublicPageBlocks(PAGE_CONTENT_KEYS.contact)
  const { data, isError, error } = useQuery({
    queryKey: ['page-content', 'contact'],
    queryFn: () => pageContentService.getContact(),
    placeholderData: defaultContactContent,
    ...publicQueryOptions,
  })

  const content = { ...defaultContactContent, ...data }

  usePageMeta({
    title: 'İletişim',
    description: content.heroSubtitle || 'Woontegra ile iletişime geçin.',
  })

  const legacyView = (
    <div className="bg-white">
      <PageHero
        title={content.heroTitle || 'İletişim'}
        description={content.heroSubtitle}
        image={content.heroImage}
        breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'İletişim' }]}
      />
      <ContactPageBody content={content} contentError={isError ? error : undefined} />
    </div>
  )

  if (blocks && blocks.length > 0) {
    return (
      <div className="bg-white">
        <PageBlocksRenderer blocks={blocks} mode="public" />
        <ContactPageBody content={content} contentError={isError ? error : undefined} />
      </div>
    )
  }

  return legacyView
}
