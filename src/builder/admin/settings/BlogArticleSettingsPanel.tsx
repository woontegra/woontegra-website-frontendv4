import { SettingsAccordion } from '@/builder/admin/ui/SettingsAccordion'
import { ImageUrlField, TextAreaField, TextField, ToggleField } from '@/builder/admin/ui/FormFields'
import {
  SharedAdvancedSection,
  SharedContentSection,
  SharedDesignSection,
  SharedResponsiveSection,
  wrapSections,
} from '@/builder/admin/settings/SharedSections'
import { useSelectedBlock } from '@/builder/admin/settings/useSelectedBlock'
import type { BlogArticleBlock } from '@/builder/types/blogArticle'

export function BlogArticleSettingsPanel() {
  const { block, update } = useSelectedBlock<BlogArticleBlock>()
  if (!block) return null

  const { settings } = block
  const setSettings = (patch: Partial<BlogArticleBlock['settings']>) =>
    update({ ...block, settings: { ...settings, ...patch } })

  const items = wrapSections([
    {
      id: 'article',
      title: 'Makale',
      defaultOpen: true,
      content: (
        <>
          <SharedContentSection block={block} onChange={update} />
          <TextField label="Slug" value={settings.slug} onChange={(slug) => setSettings({ slug })} />
          <TextField label="Yazar" value={settings.author} onChange={(author) => setSettings({ author })} />
          <TextField label="Kategori" value={settings.category} onChange={(category) => setSettings({ category })} />
          <TextField label="Yayın tarihi" value={settings.publishedAt} onChange={(publishedAt) => setSettings({ publishedAt })} />
          <ImageUrlField label="Kapak görseli" value={settings.coverImageUrl} onChange={(coverImageUrl) => setSettings({ coverImageUrl })} />
          <TextAreaField
            label="HTML içerik"
            hint="Rich text — HTML olarak saklanır"
            value={settings.bodyHtml}
            onChange={(bodyHtml) => setSettings({ bodyHtml })}
          />
          <ToggleField
            label="İlgili yazılar"
            checked={settings.showRelatedPosts}
            onChange={(showRelatedPosts) => setSettings({ showRelatedPosts })}
          />
        </>
      ),
    },
    {
      id: 'design',
      title: 'Tasarım',
      content: <SharedDesignSection block={block} onChange={update} />,
    },
    {
      id: 'responsive',
      title: 'Responsive',
      content: <SharedResponsiveSection block={block} onChange={update} />,
    },
    {
      id: 'advanced',
      title: 'Gelişmiş',
      content: <SharedAdvancedSection block={block} onChange={update} />,
    },
  ])

  return <SettingsAccordion items={items} />
}
