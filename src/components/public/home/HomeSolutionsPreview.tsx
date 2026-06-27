import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SectionHeader } from '@/components/public/SectionHeader'
import { SolutionCard } from '@/components/public/SolutionCard'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { pageContentService } from '@/services/pageContentService'
import {
  defaultSolutionCardsBundle,
  getActiveSolutionCards,
  mergeSolutionCards,
  SOLUTION_CARDS_KEY,
} from '@/data/solutionCardsContent'

export function HomeSolutionsPreview() {
  const { data: bundle = defaultSolutionCardsBundle } = useQuery({
    queryKey: ['page-content', SOLUTION_CARDS_KEY, 'home'],
    queryFn: async () => {
      const raw = await pageContentService.getRawByKey(SOLUTION_CARDS_KEY)
      return mergeSolutionCards(defaultSolutionCardsBundle, raw as Partial<typeof defaultSolutionCardsBundle>)
    },
    placeholderData: defaultSolutionCardsBundle,
    ...publicQueryOptions,
  })

  const cards = getActiveSolutionCards(bundle).slice(0, 3)
  if (!cards.length) return null

  return (
    <section className="border-y border-slate-100 bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Çözümler"
          title="E-Ticaret ve Operasyon Çözümleri"
          description="Markanızı büyüten, operasyonu sadeleştiren hazır altyapılar."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <SolutionCard key={card.id} card={card} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/cozumler"
            className="inline-flex rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Tüm Çözümleri Gör
          </Link>
        </div>
      </div>
    </section>
  )
}
