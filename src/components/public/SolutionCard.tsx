import type { SolutionCardConfig } from '@/data/solutionCardsContent'
import { MarketingFeatureCard } from '@/components/public/MarketingFeatureCard'

type Props = {
  card: SolutionCardConfig
}

export function SolutionCard({ card }: Props) {
  return (
    <MarketingFeatureCard
      icon={card.icon}
      title={card.title}
      description={card.description}
      href={card.href}
      gradient={card.gradient}
    />
  )
}
