import { MediaImage } from '@/media/components/MediaImage'
import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { BlockSectionHeader, SectionBlockShell } from '@/builder/render/SectionBlockShell'
import { renderIfMediaUrl, renderIfText, shouldShowField } from '@/builder/render/renderRules'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import { cn } from '@/lib/cn'
import type { ImageTextBlock } from '@/builder/types'

export function ImageTextBlockRenderer({ block }: BlockRendererProps) {
  if (block.type !== 'image-text') return null
  const b = block as ImageTextBlock
  if (!b.visibility.enabled) return null

  const imageUrl = renderIfMediaUrl(
    b.settings.imageUrl ? resolveMediaUrl(b.settings.imageUrl) : null,
  )
  const showImage = b.visibility.showImage !== false && Boolean(imageUrl)
  const btn = b.settings.button
  const showBtn =
    b.visibility.showButton !== false &&
    btn?.visible !== false &&
    renderIfText(btn?.label) &&
    renderIfText(btn?.href)

  const hasHeader =
    shouldShowField(b.visibility.showTitle, renderIfText(b.title)) ||
    shouldShowField(b.visibility.showDescription, renderIfText(b.description))

  if (!showImage && !hasHeader && !showBtn) return null

  const imageFirst = b.settings.imagePosition !== 'right'

  const imageEl =
    showImage && imageUrl ? (
      <MediaImage
        src={imageUrl}
        alt={b.settings.imageAlt ?? b.title ?? ''}
        className="h-auto w-full rounded-xl object-cover"
      />
    ) : null

  const textEl = (
    <div>
      <BlockSectionHeader
        title={b.title}
        description={b.description}
        showTitle={b.visibility.showTitle}
        showDescription={b.visibility.showDescription}
      />
      {showBtn ? (
        <a
          href={btn!.href}
          className="mt-4 inline-flex rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          {btn!.label}
        </a>
      ) : null}
    </div>
  )

  return (
    <SectionBlockShell style={b.style}>
      <div
        className={cn(
          'grid items-center gap-8',
          showImage ? 'md:grid-cols-2' : 'grid-cols-1',
        )}
      >
        {imageFirst ? (
          <>
            {imageEl}
            {textEl}
          </>
        ) : (
          <>
            {textEl}
            {imageEl}
          </>
        )}
      </div>
    </SectionBlockShell>
  )
}
