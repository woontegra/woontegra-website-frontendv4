import { Link } from 'react-router-dom'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { PageHero } from '@/components/public/PageHero'
import type { SolutionDetailContent } from '@/data/solutionCatalog'

type Props = {
  content: SolutionDetailContent
}

export function SolutionDetailLayout({ content }: Props) {
  return (
    <div className="bg-white">
      <PageHero
        variant="compact"
        eyebrow="Çözüm"
        title={content.title}
        description={content.description}
        image={content.logo}
        imageAlt={content.logoAlt ?? content.title}
        breadcrumbs={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Çözümler', href: '/cozumler' },
          { label: content.title },
        ]}
      >
        {content.externalUrl ? (
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={content.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Siteyi ziyaret et
              <ExternalLink className="h-4 w-4" />
            </a>
            <Link
              to="/iletisim"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white hover:text-slate-900"
            >
              İletişime geç
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </PageHero>

      <section className="bg-slate-900 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold sm:text-3xl">Projeniz için teklif alın</h2>
          <p className="mt-4 text-slate-300">
            Çözümlerimiz hakkında detaylı bilgi veya özel proje teklifi için bizimle iletişime geçin.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/iletisim" className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700">
              İletişime Geç
            </Link>
            <Link to="/cozumler" className="rounded-lg border border-slate-600 px-6 py-3 font-semibold hover:bg-white/10">
              Tüm Çözümler
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
