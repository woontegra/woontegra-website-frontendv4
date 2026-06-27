import type { PublishStatus } from './common'
import type { BuilderBlock } from './blocks'

export type BuilderPage = {
  id: string
  slug: string
  title: string
  status: PublishStatus
  seoTitle?: string
  seoDescription?: string
  ogImage?: string
  blocks: BuilderBlock[]
}
