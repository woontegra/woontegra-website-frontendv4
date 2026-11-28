type Props = {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
}

export function SectionHeader({ eyebrow, title, description, align = 'center' }: Props) {
  const centered = align === 'center'
  return (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-base text-slate-600">{description}</p> : null}
    </div>
  )
}
