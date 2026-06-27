import type { ReactNode } from 'react'
import { PageBlocksRenderer } from '@/builder/render/PageBlocksRenderer'
import type { BuilderBlock } from '@/builder/types'

type Props = {
  blocks: BuilderBlock[] | null | undefined
  fallback: ReactNode
  className?: string
}

/** Kaydedilmiş builder blokları varsa public renderer; yoksa legacy bileşenler */
export function PublicBuilderBlocksPage({ blocks, fallback, className = 'bg-white' }: Props) {
  if (blocks && blocks.length > 0) {
    return (
      <div className={className}>
        <PageBlocksRenderer blocks={blocks} mode="public" />
      </div>
    )
  }
  return <>{fallback}</>
}
