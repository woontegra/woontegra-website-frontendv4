import type { ReactNode } from 'react'
import { PageShell } from '@/components/public/PageShell'
import { formatLegalDate } from '@/data/legalCompanyInfo'
import { usePageMeta } from '@/hooks/usePageMeta'

export type LegalTocItem = {
  id: string
  label: string
}

type LegalPageLayoutProps = {
  title: string
  subtitle: string
  seoTitle: string
  seoDescription: string
  updatedAt?: string
  toc?: LegalTocItem[]
  children: ReactNode
}

export function LegalPageLayout({
  title,
  subtitle,
  seoTitle,
  seoDescription,
  updatedAt,
  toc = [],
  children,
}: LegalPageLayoutProps) {
  usePageMeta({ title: seoTitle, description: seoDescription })

  return (
    <PageShell
      breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: title }]}
      title={title}
      description={subtitle}
      maxWidth={toc.length > 0 ? '6xl' : '3xl'}
    >
      {updatedAt ? (
        <p className="mb-6 text-sm text-slate-500">Son güncelleme: {formatLegalDate(updatedAt)}</p>
      ) : null}
      <div className={toc.length > 0 ? 'grid gap-10 lg:grid-cols-[220px_1fr]' : ''}>
        {toc.length > 0 ? (
          <aside className="hidden lg:block">
            <nav className="sticky top-24 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">İçindekiler</p>
              <ul className="space-y-1">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-white hover:text-emerald-700"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        ) : null}
        <div className="min-w-0 space-y-8">{children}</div>
      </div>
    </PageShell>
  )
}

export function LegalSection({
  title: sectionTitle,
  id,
  children,
}: {
  title: string
  id?: string
  children: ReactNode
}) {
  const sectionId = id ?? sectionTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  return (
    <section id={sectionId} className="scroll-mt-28">
      <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{sectionTitle}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-700 sm:text-base">{children}</div>
    </section>
  )
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
