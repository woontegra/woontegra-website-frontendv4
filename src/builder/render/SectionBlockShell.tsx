import type { ReactNode } from 'react'
import type { BlockStyle } from '@/builder/types'
import { BuilderField } from '@/builder/edit/BuilderField'
import { cn } from '@/lib/cn'

const WIDTH: Record<NonNullable<BlockStyle['containerWidth']>, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-7xl',
  wide: 'max-w-[90rem]',
  full: 'max-w-none',
}

type Props = {
  style: BlockStyle
  children: ReactNode
  className?: string
}

export function SectionBlockShell({ style, children, className }: Props) {
  const pt = style.paddingTop?.desktop ?? '48px'
  const pb = style.paddingBottom?.desktop ?? '48px'
  const width = WIDTH[style.containerWidth ?? 'default']
  const align =
    style.contentAlign === 'center'
      ? 'text-center'
      : style.contentAlign === 'right'
        ? 'text-right'
        : 'text-left'

  return (
    <section
      className={cn('w-full', className, style.customClass)}
      style={{
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage ? `url(${style.backgroundImage})` : undefined,
        background: style.backgroundGradient ?? undefined,
        paddingTop: pt,
        paddingBottom: pb,
      }}
    >
      <div className={cn('mx-auto px-4', width, align)}>{children}</div>
    </section>
  )
}

export function BlockSectionHeader({
  title,
  description,
  showTitle,
  showDescription,
}: {
  title?: string
  description?: string
  showTitle?: boolean
  showDescription?: boolean
}) {
  const t = title?.trim()
  const d = description?.trim()
  if (showTitle === false && showDescription === false) return null
  if (showTitle !== false && !t && showDescription !== false && !d) return null

  return (
    <header className="mb-8">
      {showTitle !== false && t ? (
        <BuilderField path="title" label="Başlık" type="text" className="w-fit max-w-full">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">{t}</h2>
        </BuilderField>
      ) : null}
      {showDescription !== false && d ? (
        <BuilderField path="description" label="Açıklama" type="text" className="w-fit max-w-full">
          <p className="mt-2 text-slate-600">{d}</p>
        </BuilderField>
      ) : null}
    </header>
  )
}
