import { PageShell } from '@/components/public/PageShell'
import type { LegalPageContent } from '@/types/legalPageContent'
import { sectionBodyHtml } from '@/types/legalPageContent'

type Props = {
  content: LegalPageContent
}

export function LegalCookieView({ content }: Props) {
  const sections = content.sections.filter((s) => s.active)

  return (
    <PageShell
      breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: content.title }]}
      title={content.title}
      description={content.description}
      maxWidth="3xl"
    >
      {content.updatedAtLabel ? (
        <p className="mb-6 text-sm text-slate-500">Son güncelleme: {content.updatedAtLabel}</p>
      ) : null}
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.id}>
            <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
            <div
              className="prose prose-slate mt-3 max-w-none text-sm leading-relaxed text-slate-700 sm:text-base"
              dangerouslySetInnerHTML={{ __html: sectionBodyHtml(section) }}
            />
          </section>
        ))}
      </div>
    </PageShell>
  )
}
