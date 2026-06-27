import type { BlockBase } from './common'

export type LegacySectionSettings = {
  sectionKey: string
  title: string
  source: string
  locked: boolean
  renderMode: 'public'
  payload?: unknown
}

export type LegacySectionBlock = BlockBase & {
  type: 'legacy-section'
  settings: LegacySectionSettings
}

export function createLegacySectionBlock(
  id: string,
  sortOrder: number,
  sectionKey: string,
  title: string,
  payload?: unknown,
  source = 'home-page-content',
): LegacySectionBlock {
  return {
    id,
    type: 'legacy-section',
    sortOrder,
    title,
    description: '',
    visibility: {
      enabled: true,
      showTitle: false,
      showDescription: false,
      showImage: false,
      showButton: false,
    },
    style: {
      containerWidth: 'full',
      contentAlign: 'left',
      paddingTop: { desktop: '0', mobile: '0' },
      paddingBottom: { desktop: '0', mobile: '0' },
    },
    settings: {
      sectionKey,
      title,
      source,
      locked: true,
      renderMode: 'public',
      payload,
    },
  }
}
