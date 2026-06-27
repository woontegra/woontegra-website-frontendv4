import { useMemo } from 'react'
import { useBuilderStore } from '@/builder/store/builderStore'
import type { BuilderBlock } from '@/builder/types'

export function useSelectedBlock<T extends BuilderBlock = BuilderBlock>() {
  const blocks = useBuilderStore((s) => s.blocks)
  const selectedBlockId = useBuilderStore((s) => s.selectedBlockId)
  const replaceBlock = useBuilderStore((s) => s.replaceBlock)

  const block = useMemo(
    () => blocks.find((b) => b.id === selectedBlockId) ?? null,
    [blocks, selectedBlockId],
  )

  const update = (next: BuilderBlock) => {
    if (!block) return
    replaceBlock(block.id, next)
  }

  return { block: block as T | null, update }
}
