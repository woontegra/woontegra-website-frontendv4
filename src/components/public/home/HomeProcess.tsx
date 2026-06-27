import { enabledProcessSteps, type HomePageContent } from '@/types/homePageContent'

type Props = { process: HomePageContent['process'] }

export function HomeProcess({ process }: Props) {
  if (!process.enabled) return null

  const steps = enabledProcessSteps(process.steps)
  if (!steps.length) return null

  return (
    <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">{process.title}</h2>
          {process.subtitle ? <p className="text-lg text-gray-400">{process.subtitle}</p> : null}
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <div key={item.id} className="group text-center">
              <div
                className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-bold text-white shadow-lg transition-transform group-hover:scale-110 sm:mb-6 sm:h-20 sm:w-20 sm:text-2xl ${item.color}`}
              >
                {item.step}
              </div>
              <h3 className="mb-2 text-lg font-bold text-white sm:mb-3 sm:text-xl">{item.title}</h3>
              <p className="text-sm leading-relaxed text-gray-400 sm:text-base">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
