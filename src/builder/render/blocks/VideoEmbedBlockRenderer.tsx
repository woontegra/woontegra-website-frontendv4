import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { BlockSectionHeader, SectionBlockShell } from '@/builder/render/SectionBlockShell'
import { renderIfText } from '@/builder/render/renderRules'
import { extractYoutubeVideoId } from '@/builder/lib/richTextHtml'
import type { VideoEmbedBlock } from '@/builder/types/contentBlocks'

export function VideoEmbedBlockRenderer({ block }: BlockRendererProps) {
  if (block.type !== 'video-embed') return null
  const b = block as VideoEmbedBlock
  if (!b.visibility.enabled) return null

  const videoId = extractYoutubeVideoId(b.settings.youtubeUrl || '')
  const hasHeader =
    (b.visibility.showTitle !== false && renderIfText(b.title)) ||
    (b.visibility.showDescription !== false && renderIfText(b.description))
  const caption = renderIfText(b.settings.caption)

  if (!videoId && !hasHeader && !caption) return null

  return (
    <SectionBlockShell style={b.style}>
      <BlockSectionHeader
        title={b.title}
        description={b.description}
        showTitle={b.visibility.showTitle}
        showDescription={b.visibility.showDescription}
      />
      {videoId ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm">
          <div className="relative aspect-video w-full">
            <iframe
              title={b.title || 'YouTube video'}
              src={`https://www.youtube.com/embed/${videoId}`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">Geçerli bir YouTube URL’si ekleyin.</p>
      )}
      {caption ? <p className="mt-3 text-sm text-slate-600">{caption}</p> : null}
    </SectionBlockShell>
  )
}
