import { HomeIcon } from '@/lib/homeIcons'
import { enabledWhy, type HomePageContent } from '@/types/homePageContent'

type Props = { why: HomePageContent['why'] }

export function HomeWhy({ why }: Props) {
  if (!why.enabled) return null

  const cards = enabledWhy(why.cards)
  if (!cards.length) return null

  return (
    <section className="bg-white py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">{why.title}</h2>
          {why.subtitle ? <p className="text-lg text-slate-600">{why.subtitle}</p> : null}
        </div>
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl border border-gray-200 bg-slate-50 p-6 transition-all duration-300 hover:border-green-500 hover:shadow-xl sm:p-8"
            >
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl shadow-lg transition-transform group-hover:scale-110 ${item.color}`}
              >
                <HomeIcon name={item.icon} className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900 sm:mb-3 sm:text-xl">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
