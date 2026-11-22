import { MOUNT_DEFERRED_BLOCKS_EVENT, scrollToPageAnchor } from '@/builder/render/pageAnchorScroll'
import { Suspense, lazy, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react'
import type { BuilderBlock } from '@/builder/types'
import { HeroBlockRenderer } from '@/builder/render/blocks/HeroBlockRenderer'
import { getBlockRendererLoader, type BlockRendererProps } from '@/builder/registry/renderRegistry'

type Props = {
  blocks: BuilderBlock[]
  mode?: 'public' | 'preview'
  /** Builder canvas — her blok köküne data-builder-block-* ekler */
  annotateBlocks?: boolean
  /** false: tüm blokları hemen render et (uzun landing sayfaları) */
  deferBelowFold?: boolean
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

function annotateWrap(block: BuilderBlock, annotateBlocks: boolean, content: ReactNode) {
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

function LazyBlockSlot({
  block,
  mode,
  annotateBlocks,
}: {
  block: BuilderBlock
  mode: 'public' | 'preview'
  annotateBlocks: boolean
}) {
  const Renderer = useMemo(() => resolveLazyRenderer(block.type), [block.type])
  return annotateWrap(
    block,
    annotateBlocks,
    <Suspense fallback={<BlockRenderFallback />}>
      <Renderer block={block} mode={mode} />
    </Suspense>,
  )
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
  if (block.type === 'hero') {
    return annotateWrap(block, annotateBlocks, <HeroBlockRenderer block={block} mode={mode} />)
  }
  return <LazyBlockSlot block={block} mode={mode} annotateBlocks={annotateBlocks} />
}

function DeferredBlockSlot({
  block,
  mode,
  annotateBlocks,
}: {
  block: BuilderBlock
  mode: 'public' | 'preview'
  annotateBlocks: boolean
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { rootMargin: '280px 0px', threshold: 0.01 },
    )

    obs.observe(el)
    const mountNow = () => {
      setVisible(true)
      obs.disconnect()
    }
    window.addEventListener(MOUNT_DEFERRED_BLOCKS_EVENT, mountNow)
    return () => {
      obs.disconnect()
      window.removeEventListener(MOUNT_DEFERRED_BLOCKS_EVENT, mountNow)
    }
  }, [])

  return (
    <div ref={rootRef} className="w-full">
      {visible ? (
        <BlockSlot block={block} mode={mode} annotateBlocks={annotateBlocks} />
      ) : (
        <BlockRenderFallback />
      )}
    </div>
  )
}

export function PageBlocksRenderer({
  blocks,
  mode = 'public',
  annotateBlocks = false,
  deferBelowFold: deferBelowFoldProp,
}: Props) {
  const sorted = useMemo(() => [...blocks].sort((a, b) => a.sortOrder - b.sortOrder), [blocks])
  const deferBelowFold = deferBelowFoldProp ?? (mode === 'public' && !annotateBlocks)

  // Sayfa #bölüm ile açıldıysa (ör. paylaşılan link) hedef bloğu yükleyip oraya kaydır.
  useEffect(() => {
    if (!deferBelowFold) return
    const goToHash = () => {
      const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''))
      if (hash) scrollToPageAnchor(hash)
    }
    goToHash()
    // Düz <a href="#..."> linkleri de çalışsın.
    window.addEventListener('hashchange', goToHash)
    return () => window.removeEventListener('hashchange', goToHash)
  }, [deferBelowFold])

  if (!deferBelowFold) {
    return (
      <>
        {sorted.map((block) => (
          <BlockSlot key={block.id} block={block} mode={mode} annotateBlocks={annotateBlocks} />
        ))}
      </>
    )
  }

  const [first, ...rest] = sorted
  if (!first) return null

  return (
    <>
      <BlockSlot block={first} mode={mode} annotateBlocks={annotateBlocks} />
      {rest.map((block) => (
        <DeferredBlockSlot
          key={block.id}
          block={block}
          mode={mode}
          annotateBlocks={annotateBlocks}
        />
      ))}
    </>
  )
}

/** Ana sayfa hero chunk'ını API beklerken paralel indirmeye başlatır. */
export function prefetchHeroBlockRenderer(): void {
  void getBlockRendererLoader('hero')()
}
