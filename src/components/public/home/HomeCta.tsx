import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { HomePageContent } from '@/types/homePageContent'

type Props = { cta: HomePageContent['cta'] }

export function HomeCta({ cta }: Props) {
  if (!cta.enabled) return null

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 py-14 sm:py-16 lg:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-4 text-3xl font-bold text-white sm:mb-6 sm:text-4xl md:text-5xl">{cta.title}</h2>
        {cta.subtitle ? (
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90 sm:mb-10 sm:text-xl">{cta.subtitle}</p>
        ) : null}
        {cta.buttonText ? (
          <Link
            to={cta.buttonHref || '/iletisim'}
            className="inline-flex items-center justify-center rounded-lg border border-white/30 px-8 py-3.5 text-base text-white transition-all hover:bg-white hover:text-green-600 sm:px-10 sm:py-4"
          >
            {cta.buttonText}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        ) : null}
      </div>
    </section>
  )
}
