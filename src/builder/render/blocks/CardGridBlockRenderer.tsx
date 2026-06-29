import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { BuilderField } from '@/builder/edit/BuilderField'
import { BlockSectionHeader, SectionBlockShell } from '@/builder/render/SectionBlockShell'
import { renderIfText } from '@/builder/render/renderRules'
import { MediaImage } from '@/media/components/MediaImage'
import { HomeIcon } from '@/lib/homeIcons'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import { cn } from '@/lib/cn'
import type { CardGridBlock, CardGridItem } from '@/builder/types'
import { CardButtonLabel, CardLinkShell } from '@/builder/render/blocks/CardGridCardLink'

export function CardGridBlockRenderer({ block }: BlockRendererProps) {
  if (block.type !== 'card-grid') return null
  const b = block as CardGridBlock
  if (!b.visibility.enabled) return null

  const variant = b.settings.variant ?? 'default'
  const cards = b.settings.cards.filter(
    (c) => renderIfText(c.title) || renderIfText(c.description) || c.imageUrl,
  )

  if (variant === 'intro') return <IntroVariant block={b} cards={cards} />
  if (variant === 'icon-dark') return <IconDarkVariant block={b} cards={cards} />
  if (variant === 'logo') return <LogoVariant block={b} cards={cards} />
  if (variant === 'steps') return <StepsVariant block={b} cards={cards} />
  if (variant === 'why') return <WhyVariant block={b} cards={cards} />
  if (variant === 'solutions') return <SolutionsVariant block={b} cards={cards} />
  if (variant === 'timeline') return <TimelineVariant block={b} cards={cards} />
  if (variant === 'about-brands') return <AboutBrandsVariant block={b} cards={cards} />

  return <DefaultVariant block={b} cards={cards} />
}

function DefaultVariant({ block, cards }: { block: CardGridBlock; cards: CardGridItem[] }) {
  const cols = block.settings.columns ?? 3
  const colClass =
    cols === 2 ? 'md:grid-cols-2' : cols === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'

  return (
    <SectionBlockShell style={block.style}>
      <BlockSectionHeader
        title={block.title}
        description={block.description}
        showTitle={block.visibility.showTitle}
        showDescription={block.visibility.showDescription}
      />
      {cards.length > 0 ? (
        <div className={cn('grid gap-6', colClass)}>
          {cards.map((card) => (
            <DefaultCard key={card.id} card={card} />
          ))}
        </div>
      ) : null}
    </SectionBlockShell>
  )
}

function IntroVariant({ block, cards }: { block: CardGridBlock; cards: CardGridItem[] }) {
  return (
    <section
      className="relative bg-gradient-to-b from-white via-slate-50 to-white py-14 sm:py-16"
      style={{
        paddingTop: block.style.paddingTop?.desktop,
        paddingBottom: block.style.paddingBottom?.desktop,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {block.settings.eyebrow ? (
            <BuilderField path="eyebrow" label="Üst başlık" type="text" className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {block.settings.eyebrow}
              </p>
            </BuilderField>
          ) : null}
          <BuilderField path="title" label="Ana başlık" type="text" className="w-fit max-w-full mx-auto">
            <h2 className="text-balance bg-gradient-to-r from-emerald-700 via-green-600 to-blue-700 bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl">
              {block.title}
            </h2>
          </BuilderField>
          {block.description ? (
            <BuilderField path="description" label="Açıklama" type="text" className="mx-auto mt-4 max-w-2xl">
              <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">{block.description}</p>
            </BuilderField>
          ) : null}
        </div>
        {cards.length > 0 ? (
          <div className="mx-auto mt-10 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <CardLinkShell
                key={card.id}
                card={card}
                as="div"
                className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur"
              >
                {card.icon ? (
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border bg-gradient-to-br from-emerald-600/10 to-transparent text-xs font-bold text-emerald-700">
                    {card.icon}
                  </div>
                ) : null}
                <CardTitleDescription card={card} />
                <CardButtonLabel card={card} />
              </CardLinkShell>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function IconDarkVariant({ block, cards }: { block: CardGridBlock; cards: CardGridItem[] }) {
  return (
    <section
      id="hizmetler"
      className="bg-slate-900 py-14 sm:py-16 lg:py-20"
      style={{
        backgroundColor: block.style.backgroundColor,
        paddingTop: block.style.paddingTop?.desktop,
        paddingBottom: block.style.paddingBottom?.desktop,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <BuilderField path="title" label="Başlık" type="text" className="mx-auto w-fit">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">{block.title}</h2>
          </BuilderField>
          {block.description ? (
            <BuilderField path="description" label="Açıklama" type="text" className="mx-auto w-fit">
              <p className="text-lg text-gray-400">{block.description}</p>
            </BuilderField>
          ) : null}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <CardLinkShell
              key={card.id}
              card={card}
              as="div"
              className="group relative rounded-2xl border border-slate-700 bg-slate-800 p-6 sm:p-8"
            >
              {card.color ? (
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.color} opacity-0 transition group-hover:opacity-10`}
                />
              ) : null}
              {card.icon ? (
                <div
                  className={cn(
                    'mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg sm:mb-6 sm:h-16 sm:w-16',
                    card.color ?? 'from-emerald-500 to-green-600',
                  )}
                >
                  <HomeIcon name={card.icon} className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                </div>
              ) : null}
              <CardTitleDescription card={card} light />
              <CardButtonLabel card={card} light />
            </CardLinkShell>
          ))}
        </div>
      </div>
    </section>
  )
}

function LogoVariant({ block, cards }: { block: CardGridBlock; cards: CardGridItem[] }) {
  return (
    <SectionBlockShell style={block.style}>
      <BlockSectionHeader
        title={block.title}
        description={block.description}
        showTitle={block.visibility.showTitle}
        showDescription={block.visibility.showDescription}
      />
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <CardLinkShell
            key={card.id}
            card={card}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            {card.imageUrl ? (
              <MediaImage
                src={resolveMediaUrl(card.imageUrl)}
                alt={card.title}
                className="mb-4 aspect-video w-full rounded-lg object-cover"
              />
            ) : null}
            <CardTitleDescription card={card} />
            <CardButtonLabel card={card} />
          </CardLinkShell>
        ))}
      </div>
    </SectionBlockShell>
  )
}

function StepsVariant({ block, cards }: { block: CardGridBlock; cards: CardGridItem[] }) {
  const cols = block.settings.columns ?? 4
  const colClass =
    cols === 2 ? 'md:grid-cols-2' : cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'

  return (
    <SectionBlockShell style={block.style}>
      <BlockSectionHeader
        title={block.title}
        description={block.description}
        showTitle={block.visibility.showTitle}
        showDescription={block.visibility.showDescription}
      />
      <div className={cn('grid gap-6', colClass)}>
        {cards.map((card) => (
          <CardLinkShell
            key={card.id}
            card={card}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            {card.icon ? (
              <span className="text-2xl font-bold text-emerald-600">{card.icon}</span>
            ) : null}
            <CardTitleDescription card={card} />
            <CardButtonLabel card={card} />
          </CardLinkShell>
        ))}
      </div>
    </SectionBlockShell>
  )
}

function WhyVariant({ block, cards }: { block: CardGridBlock; cards: CardGridItem[] }) {
  const cols = block.settings.columns ?? 3
  const colClass =
    cols === 4
      ? 'sm:grid-cols-2 lg:grid-cols-4'
      : cols === 2
        ? 'md:grid-cols-2'
        : 'md:grid-cols-2 lg:grid-cols-3'

  return (
    <section
      className="py-20 md:py-24"
      style={{
        paddingTop: block.style.paddingTop?.desktop,
        paddingBottom: block.style.paddingBottom?.desktop,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <BuilderField path="title" label="Başlık" type="text" className="mx-auto w-fit">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{block.title}</h2>
          </BuilderField>
          {block.description ? (
            <BuilderField path="description" label="Açıklama" type="text" className="mx-auto mt-4 w-fit">
              <p className="text-base text-slate-600">{block.description}</p>
            </BuilderField>
          ) : null}
        </div>
        <div className={cn('mt-12 grid gap-6', colClass)}>
          {cards.map((card) => (
            <CardLinkShell
              key={card.id}
              card={card}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              {card.icon ? (
                <div
                  className={cn(
                    'mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white',
                    card.color ?? 'from-emerald-500 to-green-600',
                  )}
                >
                  <HomeIcon name={card.icon} className="h-6 w-6" />
                </div>
              ) : null}
              <CardTitleDescription card={card} />
              <CardButtonLabel card={card} />
            </CardLinkShell>
          ))}
        </div>
      </div>
    </section>
  )
}

function SolutionsVariant({ block, cards }: { block: CardGridBlock; cards: CardGridItem[] }) {
  return (
    <section className="border-y border-slate-100 bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {block.settings.eyebrow ? (
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-emerald-600">
            {block.settings.eyebrow}
          </p>
        ) : null}
        <BlockSectionHeader
          title={block.title}
          description={block.description}
          showTitle={block.visibility.showTitle}
          showDescription={block.visibility.showDescription}
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <CardLinkShell
              key={card.id}
              card={card}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              {card.icon ? (
                <div
                  className={cn(
                    'mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white',
                    card.color ?? 'from-emerald-500 to-teal-600',
                  )}
                >
                  <HomeIcon name={card.icon} className="h-6 w-6" />
                </div>
              ) : null}
              <CardTitleDescription card={card} />
              <CardButtonLabel card={card} />
            </CardLinkShell>
          ))}
        </div>
      </div>
    </section>
  )
}

function TimelineVariant({ block, cards }: { block: CardGridBlock; cards: CardGridItem[] }) {
  return (
    <section
      className="py-20 md:py-24"
      style={{
        paddingTop: block.style.paddingTop?.desktop,
        paddingBottom: block.style.paddingBottom?.desktop,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <BuilderField path="title" label="Başlık" type="text" className="mx-auto w-fit">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{block.title}</h2>
          </BuilderField>
          {block.description ? (
            <BuilderField path="description" label="Açıklama" type="text" className="mx-auto mt-4 w-fit">
              <p className="text-base text-slate-600">{block.description}</p>
            </BuilderField>
          ) : null}
        </div>
        <div className="mx-auto mt-14 max-w-3xl">
          {cards.map((step, index) => (
            <div key={step.id} className="relative flex gap-5 pb-10 last:pb-0">
              <div className="relative z-10 flex shrink-0">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full shadow-lg',
                    step.color?.startsWith('bg-') ? step.color : 'bg-blue-500',
                  )}
                >
                  {step.icon ? (
                    <HomeIcon name={step.icon} className="h-5 w-5 text-white" />
                  ) : null}
                </div>
              </div>
              <CardLinkShell
                card={step}
                as="div"
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Adım {index + 1}</p>
                <CardTitleDescription card={step} />
                <CardButtonLabel card={step} />
              </CardLinkShell>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AboutBrandsVariant({ block, cards }: { block: CardGridBlock; cards: CardGridItem[] }) {
  return (
    <section
      className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-24"
      style={{
        background: block.style.backgroundGradient ?? undefined,
        paddingTop: block.style.paddingTop?.desktop,
        paddingBottom: block.style.paddingBottom?.desktop,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <BuilderField path="title" label="Başlık" type="text" className="mx-auto w-fit">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{block.title}</h2>
          </BuilderField>
          {block.description ? (
            <BuilderField path="description" label="Açıklama" type="text" className="mx-auto mt-4 w-fit">
              <p className="text-base text-slate-600">{block.description}</p>
            </BuilderField>
          ) : null}
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {cards.map((brand) => (
            <CardLinkShell
              key={brand.id}
              card={brand}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-xl"
            >
              {brand.imageUrl ? (
                <BuilderField path={`card.${brand.id}.image`} label="Marka görseli" type="media" className="relative">
                  <div className="relative h-48 overflow-hidden sm:h-52">
                    <MediaImage
                      src={resolveMediaUrl(brand.imageUrl)}
                      alt={brand.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
                  </div>
                </BuilderField>
              ) : null}
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <BuilderField path={`card.${brand.id}.title`} label="Marka adı" type="card" className="w-fit">
                  <h3 className="text-lg font-bold text-slate-900">{brand.title}</h3>
                </BuilderField>
                {renderIfText(brand.description) ? (
                  <BuilderField
                    path={`card.${brand.id}.description`}
                    label="Marka açıklaması"
                    type="card"
                    className="w-fit max-w-full"
                  >
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{brand.description}</p>
                  </BuilderField>
                ) : null}
                <BuilderField path={`card.${brand.id}.href`} label="Marka linki" type="text" className="w-fit">
                  <CardButtonLabel card={brand} />
                </BuilderField>
              </div>
            </CardLinkShell>
          ))}
        </div>
      </div>
    </section>
  )
}

function DefaultCard({ card }: { card: CardGridItem }) {
  return (
    <CardLinkShell card={card} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <CardTitleDescription card={card} />
      <CardButtonLabel card={card} />
    </CardLinkShell>
  )
}

function CardTitleDescription({ card, light }: { card: CardGridItem; light?: boolean }) {
  return (
    <>
      {renderIfText(card.title) ? (
        <BuilderField path={`card.${card.id}.title`} label="Kart Başlığı" type="card" className="w-fit max-w-full">
          <h3 className={cn('font-semibold', light ? 'text-lg text-white' : 'text-slate-900')}>{card.title}</h3>
        </BuilderField>
      ) : null}
      {renderIfText(card.description) ? (
        <BuilderField
          path={`card.${card.id}.description`}
          label="Kart Açıklaması"
          type="card"
          className="w-fit max-w-full"
        >
          <p className={cn('mt-2 text-sm', light ? 'text-gray-400' : 'text-slate-600')}>{card.description}</p>
        </BuilderField>
      ) : null}
    </>
  )
}
