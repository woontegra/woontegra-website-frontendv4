import { Link } from 'react-router-dom'
import { HomeIcon } from '@/lib/homeIcons'
import { enabledServices, type HomePageContent } from '@/types/homePageContent'

type Props = { services: HomePageContent['services'] }

export function HomeServices({ services }: Props) {
  if (!services.enabled) return null

  const cards = enabledServices(services.cards)
  if (!cards.length) return null

  return (
    <section id="hizmetler" className="bg-slate-900 py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">{services.title}</h2>
          {services.subtitle ? <p className="text-lg text-gray-400">{services.subtitle}</p> : null}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((service) => (
            <div
              key={service.id}
              className="group relative rounded-2xl border border-slate-700 bg-slate-800 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-green-500/50 sm:p-8"
            >
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.color} opacity-0 transition-opacity group-hover:opacity-10`}
              />
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${service.color} shadow-lg sm:mb-6 sm:h-16 sm:w-16`}
              >
                <HomeIcon name={service.icon} className="h-7 w-7 text-white sm:h-8 sm:w-8" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-white sm:mb-3 sm:text-xl">{service.title}</h3>
              <p className="text-sm leading-relaxed text-gray-400 sm:text-base">{service.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/hizmetler"
            className="inline-flex rounded-lg border border-white/20 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Tüm Hizmetleri Gör
          </Link>
        </div>
      </div>
    </section>
  )
}
