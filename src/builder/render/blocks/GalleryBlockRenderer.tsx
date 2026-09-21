import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { BlockSectionHeader, SectionBlockShell } from '@/builder/render/SectionBlockShell'
import { renderIfText } from '@/builder/render/renderRules'
import type { GalleryBlock } from '@/builder/types/contentBlocks'
import { MediaImage } from '@/media/components/MediaImage'
import { cn } from '@/lib/cn'

export function GalleryBlockRenderer({ block }: BlockRendererProps) {
  if (block.type !== 'gallery') return null
  const b = block as GalleryBlock
  if (!b.visibility.enabled) return null

  const images = (b.settings.images || []).filter((img) => renderIfText(img.url))
  const hasHeader =
    (b.visibility.showTitle !== false && renderIfText(b.title)) ||
    (b.visibility.showDescription !== false && renderIfText(b.description))
  if (!images.length && !hasHeader) return null

  const columns = b.settings.columns || 3
  const colClass =
    columns === 2 ? 'sm:grid-cols-2' : columns === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'

  return (
    <SectionBlockShell style={b.style}>
      <BlockSectionHeader
        title={b.title}
        description={b.description}
        showTitle={b.visibility.showTitle}
        showDescription={b.visibility.showDescription}
      />
      {images.length ? (
        <div className={cn('mt-6 grid gap-4', colClass)}>
          {images.map((img) => (
            <figure
              key={img.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm"
            >
              <MediaImage
                src={img.url}
                alt={img.alt || b.title || 'Galeri görseli'}
                className="h-full w-full object-cover aspect-[4/3]"
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {img.alt ? (
                <figcaption className="px-3 py-2 text-xs text-slate-500">{img.alt}</figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : null}
    </SectionBlockShell>
  )
}
