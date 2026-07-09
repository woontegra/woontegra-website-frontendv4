import { Suspense, lazy, useMemo, type ComponentType } from 'react'
import type { BuilderBlock } from '@/builder/types'
import { getBlockRendererLoader, type BlockRendererProps } from '@/builder/registry/renderRegistry'

type Props = {
  blocks: BuilderBlock[]
  mode?: 'public' | 'preview'
  /** Builder canvas — her blok köküne data-builder-block-* ekler */
  annotateBlocks?: boolean
}

const lazyRendererCache = new Map<string, ComponentType<BlockRendererProps>>()

function resolveLazyRenderer(type: string): ComponentType<BlockRendererProps> {
  const cached = lazyRendererCache.get(type)
  if (cached) return cached

  const loader = getBlockRendererLoader(type)
  const LazyRenderer = lazy(loader)
  lazyRendererCache.set(type, LazyRenderer)
  return LazyRenderer
}

function BlockRenderFallback() {
  return <div className="min-h-0 w-full" aria-hidden />
}

function BlockSlot({
  block,
  mode,
  annotateBlocks,
}: {
  block: BuilderBlock
  mode: 'public' | 'preview'
  annotateBlocks: boolean
}) {
  const Renderer = useMemo(() => resolveLazyRenderer(block.type), [block.type])

  const content = (
    <Suspense fallback={<BlockRenderFallback />}>
      <Renderer block={block} mode={mode} />
    </Suspense>
  )

  if (!annotateBlocks) return content

  return (
    <div
      data-builder-block-id={block.id}
      data-builder-block-type={block.type}
      className="builder-block-root"
    >
      {content}
    </div>
  )
}

export function PageBlocksRenderer({ blocks, mode = 'public', annotateBlocks = false }: Props) {
  const sorted = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <>
      {sorted.map((block) => (
        <BlockSlot key={block.id} block={block} mode={mode} annotateBlocks={annotateBlocks} />
      ))}
    </>
  )
}
