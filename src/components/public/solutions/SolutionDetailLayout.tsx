import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHero } from '@/components/public/PageHero'
import { SiteCtaSection } from '@/components/public/SiteCtaSection'
import { resolveIcon } from '@/lib/iconRegistry'
import { cn } from '@/lib/cn'
import type { SolutionDetailContent } from '@/data/solutionDetailContent'

type Props = {
  content: SolutionDetailContent
}

function FeatureCard({
  icon,
  title,
  description,
  gradient = 'from-emerald-500 to-teal-500',
}: {
  icon: string
  title: string
  description: string
  gradient?: string
}) {
  const Icon = resolveIcon(icon)
  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg">
      <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md', gradient)}>
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  )
}

export function SolutionDetailLayout({ content }: Props) {
  return (
    <div className="bg-white">
      <PageHero
        variant="compact"
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        description={content.hero.description}
        image={content.hero.image}
        imageAlt={content.hero.imageAlt}
        breadcrumbs={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Çözümler', href: '/cozumler' },
          { label: content.title },
        ]}
      >
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={content.hero.primaryCta.to}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700"
          >
            {content.hero.primaryCta.text}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to={content.hero.secondaryCta.to}
            className="inline-flex items-center rounded-lg border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white hover:text-slate-900"
          >
            {content.hero.secondaryCta.text}
          </Link>
        </div>
      </PageHero>

      <section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{content.audience.title}</h2>
            <p className="mt-3 text-base text-slate-600">{content.audience.subtitle}</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {content.audience.items.map((item) => {
              const Icon = resolveIcon(item.icon)
              return (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{content.benefits.title}</h2>
              <p className="mt-3 text-base text-slate-600">{content.benefits.subtitle}</p>
              <ul className="mt-6 space-y-3">
                {content.benefits.items.map((item) => (
                  <li key={item.title} className="flex gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                    <span>
                      <strong className="font-semibold text-slate-900">{item.title}.</strong> {item.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {content.benefits.items.map((item) => {
                const Icon = resolveIcon(item.icon)
                return (
                  <div key={`card-${item.title}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <Icon className="mb-3 h-6 w-6 text-emerald-600" aria-hidden />
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{content.modules.title}</h2>
            <p className="mt-3 text-base text-slate-600">{content.modules.subtitle}</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {content.modules.items.map((item) => (
              <FeatureCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                gradient={item.gradient}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{content.implementation.title}</h2>
              <p className="mt-3 text-base text-slate-600">{content.implementation.description}</p>
              <ul className="mt-6 space-y-2">
                {content.implementation.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
            {content.implementation.flowSteps.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {content.implementation.flowSteps.map((step, i) => (
                  <div
                    key={step}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {content.related.links.length > 0 ? (
        <section className="border-t border-slate-100 bg-slate-50 py-14 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-slate-900 md:text-2xl">{content.related.title}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.related.links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-200 hover:shadow-md"
                >
                  <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700">{link.label}</h3>
                  {link.description ? <p className="mt-1 text-sm text-slate-600">{link.description}</p> : null}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <SiteCtaSection
        title={content.cta.title}
        description={content.cta.description}
        buttonText={content.cta.buttonText}
        buttonLink={content.cta.buttonTo}
        secondaryButtonText={content.cta.secondaryButtonText}
        secondaryButtonLink={content.cta.secondaryButtonTo}
      />
    </div>
  )
}
