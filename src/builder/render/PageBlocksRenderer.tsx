import type { BuilderBlock } from '@/builder/types'
import { getBlockRenderer } from '@/builder/registry/renderRegistry'

type Props = {
  blocks: BuilderBlock[]
  mode?: 'public' | 'preview'
  /** Builder canvas — her blok köküne data-builder-block-* ekler */
  annotateBlocks?: boolean
}

export function PageBlocksRenderer({ blocks, mode = 'public', annotateBlocks = false }: Props) {
  const sorted = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <>
      {sorted.map((block) => {
        const Renderer = getBlockRenderer(block.type)

        if (!annotateBlocks) {
          return <Renderer key={block.id} block={block} mode={mode} />
        }

        return (
          <div
            key={block.id}
            data-builder-block-id={block.id}
            data-builder-block-type={block.type}
            className="builder-block-root"
          >
            <Renderer block={block} mode={mode} />
          </div>
        )
      })}
    </>
  )
}
