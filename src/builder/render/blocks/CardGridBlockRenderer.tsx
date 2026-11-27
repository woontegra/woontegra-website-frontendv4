import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { BuilderField } from '@/builder/edit/BuilderField'
import { useBuilderEditContext } from '@/builder/edit/BuilderEditContext'
import { BlockSectionHeader, SectionBlockShell } from '@/builder/render/SectionBlockShell'
import { renderIfText } from '@/builder/render/renderRules'
import { MediaImage } from '@/media/components/MediaImage'
import { BuilderCardIcon, resolveBuilderCardIcon } from '@/builder/render/BuilderCardIcon'
import { isMkSaasBenefitsGrid } from '@/builder/render/mkSaasBuilderVisuals'
import { hasPublicImage } from '@/media/resolvePublicImage'
import { cn } from '@/lib/cn'
import { isRemovedServicePublicLink } from '@/lib/serviceSlugs'
import type { CardGridBlock, CardGridItem } from '@/builder/types'
import { CardButtonLabel, CardLinkShell, resolveCardHref } from '@/builder/render/blocks/CardGridCardLink'

export function CardGridBlockRenderer({ block }: BlockRendererProps) {
  const { annotateFields } = useBuilderEditContext()
  if (block.type !== 'card-grid') return null
  const b = block as CardGridBlock
  if (!b.visibility.enabled) return null

  const variant = b.settings.variant ?? (isMkSaasBenefitsGrid(b) ? 'mk-benefit' : 'default')
  const cards = b.settings.cards.filter((c) => {
    if (!(renderIfText(c.title) || renderIfText(c.description) || hasPublicImage(c))) return false
    if (annotateFields) return true
    return !isRemovedServicePublicLink(resolveCardHref(c), c.title)
  })

  if (variant === 'intro') return <IntroVariant block={b} cards={cards} />
  if (variant === 'mk-benefit') return <MkBenefitVariant block={b} cards={cards} />
  if (variant === 'icon-dark') return <IconDarkVariant block={b} cards={cards} />
  if (variant === 'logo') return <LogoVariant block={b} cards={cards} />
  if (variant === 'steps') return <StepsVariant block={b} cards={cards} />
  if (variant === 'why') return <WhyVariant block={b} cards={cards} />
  if (variant === 'solutions') return <SolutionsVariant block={b} cards={cards} />
  if (variant === 'timeline') return <TimelineVariant block={b} cards={cards} />
  if (variant === 'about-brands') return <AboutBrandsVariant block={b} cards={cards} />

  return <DefaultVariant block={b} cards={cards} />
}

function MkBenefitVariant({ block, cards }: { block: CardGridBlock; cards: CardGridItem[] }) {
  const cols = block.settings.columns ?? 4
  const colClass =
    cols === 2 ? 'sm:grid-cols-2' : cols === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'

  return (
    <section
      className="py-14 sm:py-20"
      style={{
        paddingTop: block.style.paddingTop?.desktop,
        paddingBottom: block.style.paddingBottom?.desktop,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {block.visibility.showTitle !== false && renderIfText(block.title) ? (
            <BuilderField path="title" label="Başlık" type="text" className="mx-auto w-fit">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">{block.title}</h2>
            </BuilderField>
          ) : null}
          {block.visibility.showDescription !== false && renderIfText(block.description) ? (
            <BuilderField path="description" label="Açıklama" type="text" className="mx-auto mt-4 w-fit">
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">{block.description}</p>
            </BuilderField>
          ) : null}
        </div>
        {cards.length > 0 ? (
          <div className={cn('mt-10 grid gap-6', colClass)}>
            {cards.map((card) => (
              <CardLinkShell
                key={card.id}
                card={card}
                as="div"
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-sky-200 hover:shadow-md"
              >
                {card.icon ? (
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <BuilderCardIcon name={card.icon} className="h-5 w-5" />
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

function DefaultVariant({ block, cards }: { block: CardGridBlock; cards: CardGridItem[] }) {
  const cols = block.settings.columns ?? 3
  const colClass =
    cols === 2
      ? 'md:grid-cols-2'
      : cols === 4
        ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        : 'md:grid-cols-3'

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
      className="bg-white py-14 sm:py-20"
      style={{
        paddingTop: block.style.paddingTop?.desktop,
        paddingBottom: block.style.paddingBottom?.desktop,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-4 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#1D6FD8] p-7 text-white sm:p-10 md:col-span-3 lg:px-14 lg:py-12">
            {block.settings.eyebrow ? (
              <BuilderField path="eyebrow" label="Üst başlık" type="text" className="w-fit">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/80">{block.settings.eyebrow}</p>
              </BuilderField>
            ) : null}
            <BuilderField path="title" label="Ana başlık" type="text" className="w-fit max-w-full">
              <h2 className="max-w-4xl text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-4xl">{block.title}</h2>
            </BuilderField>
            {block.description ? (
              <BuilderField path="description" label="Açıklama" type="text" className="w-fit max-w-full">
                <p className="max-w-2xl text-base leading-relaxed text-white/85 whitespace-pre-line">{block.description}</p>
              </BuilderField>
            ) : null}
          </div>
          {cards.map((card, index) => (
            <CardLinkShell
              key={card.id}
              card={card}
              as="div"
              className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8"
            >
              <span aria-hidden className="mb-5 text-4xl font-extrabold tracking-tight text-slate-300 sm:mb-8 sm:text-5xl">
                {String(index + 1).padStart(2, '0')}
              </span>
              <CardTitleDescription card={card} />
              <CardButtonLabel card={card} />
            </CardLinkShell>
          ))}
        </div>
      </div>
    </section>
  )
}

function IconDarkVariant({ block, cards }: { block: CardGridBlock; cards: CardGridItem[] }) {
  return (
    <section
      id="hizmetler"
      className="border-y border-slate-200 bg-slate-50 py-14 sm:py-20 lg:py-24"
      style={{
        paddingTop: block.style.paddingTop?.desktop,
        paddingBottom: block.style.paddingBottom?.desktop,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <BuilderField path="title" label="Başlık" type="text" className="w-fit max-w-full">
            <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{block.title}</h2>
          </BuilderField>
          {block.description ? (
            <BuilderField path="description" label="Açıklama" type="text" className="w-fit max-w-full">
              <p className="max-w-md text-base leading-relaxed text-slate-600 sm:text-right sm:text-lg">{block.description}</p>
            </BuilderField>
          ) : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {cards.map((card) => (
            <CardLinkShell
              key={card.id}
              card={card}
              as="div"
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 transition hover:border-emerald-300"
            >
              {card.icon ? (
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <BuilderCardIcon name={card.icon} className="h-5 w-5" />
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
            {hasPublicImage(card) ? (
              <MediaImage
                input={card}
                alt={card.title}
                loading="lazy"
                optimizeWidth={640}
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
        {cards.map((card, index) => (
          <CardLinkShell
            key={card.id}
            card={card}
            as="div"
            className="rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-7"
          >
            {/* Step badge — asla card.icon raw string basma */}
            <span aria-hidden className="mb-6 block text-4xl font-extrabold tracking-tight text-slate-300">
              {String(index + 1).padStart(2, '0')}
            </span>
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
      className="bg-white py-14 sm:py-20 md:py-24"
      style={{
        paddingTop: block.style.paddingTop?.desktop,
        paddingBottom: block.style.paddingBottom?.desktop,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <BuilderField path="title" label="Başlık" type="text" className="w-fit max-w-full">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{block.title}</h2>
          </BuilderField>
          {block.description ? (
            <BuilderField path="description" label="Açıklama" type="text" className="mt-4 w-fit max-w-full">
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">{block.description}</p>
            </BuilderField>
          ) : null}
        </div>
        <div className={cn('mt-10 grid gap-3 sm:gap-4', colClass)}>
          {cards.map((card) => (
            <CardLinkShell
              key={card.id}
              card={card}
              className="rounded-xl border border-slate-200 bg-white p-6 transition hover:border-emerald-300 sm:p-7"
            >
              {card.icon ? (
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <BuilderCardIcon name={card.icon} className="h-5 w-5" />
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
                  <BuilderCardIcon name={card.icon} className="h-6 w-6" />
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
                    <BuilderCardIcon name={step.icon} className="h-5 w-5 text-white" />
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
      className="bg-gradient-to-b from-slate-50 to-white py-14 md:py-16"
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
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((brand) => (
            <CardLinkShell
              key={brand.id}
              card={brand}
              className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-md transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-xl"
            >
              {hasPublicImage(brand) ? (
                <BuilderField path={`card.${brand.id}.image`} label="Marka görseli" type="media" className="relative">
                  <div className="relative h-44 overflow-hidden">
                    <MediaImage
                      input={brand}
                      alt={brand.title}
                      loading="lazy"
                      optimizeWidth={640}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
                  </div>
                </BuilderField>
              ) : (
                <BuilderField path={`card.${brand.id}.image`} label="Kart görseli" type="media" className="relative">
                  <div className="relative flex h-44 items-end overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_36%),linear-gradient(180deg,#f8fafc,#e2e8f0)] p-5">
                    <div className="rounded-2xl border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 backdrop-blur">
                      Woontegra Yazılım
                    </div>
                  </div>
                </BuilderField>
              )}
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
                  <CardButtonLabel card={{ ...brand, buttonLabel: brand.buttonLabel || 'İncele' }} />
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
  const Icon = resolveBuilderCardIcon(card.icon)
  return (
    <CardLinkShell
      card={card}
      className="flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
    >
      {Icon ? (
        <div
          className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `${card.color || '#059669'}14`,
            color: card.color || '#059669',
          }}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      ) : null}
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
          <h3 className={cn('text-lg font-bold tracking-tight', light ? 'text-white' : 'text-slate-950')}>{card.title}</h3>
        </BuilderField>
      ) : null}
      {renderIfText(card.description) ? (
        <BuilderField
          path={`card.${card.id}.description`}
          label="Kart Açıklaması"
          type="card"
          className="w-fit max-w-full"
        >
          <p className={cn('mt-2 text-[15px] leading-relaxed', light ? 'text-gray-400' : 'text-slate-600')}>{card.description}</p>
        </BuilderField>
      ) : null}
    </>
  )
}
