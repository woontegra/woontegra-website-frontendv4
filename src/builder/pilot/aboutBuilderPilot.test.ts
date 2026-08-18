import { describe, expect, it } from 'vitest'
import { getBuilderPageDefinition } from '@/builder/pages/builderPageRegistry'
import {
  resolveBuilderPersistTarget,
  resolveBuilderPreviewDataSource,
} from '@/builder/pilot/aboutBuilderPilot'
import {
  canOpenAboutDraftPreview,
  hasUnpublishedAboutChanges,
  shouldKeepAboutEditorOnLoadError,
} from '@/builder/pilot/aboutPilotLoad'
import { persistBuilderPage, publishBuilderPilotPage } from '@/builder/pilot/builderPersist'
import { payloadsDiffer, stableStringify } from '@/builder/pilot/stablePayload'
import type { BuilderPageStateDto } from '@/types/builderPages'

const aboutDef = getBuilderPageDefinition('about')
const homeDef = getBuilderPageDefinition('home')

function draftState(overrides: Partial<BuilderPageStateDto> = {}): BuilderPageStateDto {
  return {
    pageKey: 'about',
    hasBuilderRecord: true,
    source: 'builder-draft',
    draftContent: { blocks: [] },
    draftUpdatedAt: '2026-08-18T08:00:00.000Z',
    publishedContent: { blocks: [] },
    publishedAt: '2026-08-17T08:00:00.000Z',
    publishedRevision: 2,
    pageContentUpdatedAt: '2026-08-17T08:00:00.000Z',
    ...overrides,
  }
}

describe('about builder persist target', () => {
  it('routes about to persistent draft and other pages to page-content', () => {
    expect(resolveBuilderPersistTarget('about')).toBe('persistent-draft')
    expect(resolveBuilderPersistTarget('home')).toBe('page-content')
    expect(resolveBuilderPersistTarget('mk-compare')).toBe('page-content')
    expect(resolveBuilderPersistTarget('contact')).toBe('page-content')
  })
})

describe('persistBuilderPage', () => {
  it('saves about through the admin draft endpoint and never calls page-content PUT', async () => {
    expect(aboutDef).toBeTruthy()
    let savedPageKey = ''
    let updated = 0

    const result = await persistBuilderPage(
      'about',
      aboutDef!,
      [],
      { heroTitle: 'Hakkımızda' },
      {
        saveDraft: async (pageKey, content) => {
          savedPageKey = pageKey
          expect(content).toMatchObject({ heroTitle: 'Hakkımızda' })
          return draftState({ draftContent: content })
        },
        publish: async () => {
          throw new Error('publish should not run during draft save')
        },
        updatePageContent: async () => {
          updated += 1
          return {}
        },
      },
    )

    expect(savedPageKey).toBe('about')
    expect(updated).toBe(0)
    expect(result.kind).toBe('persistent-draft')
  })

  it('keeps non-pilot pages on the existing page-content PUT path', async () => {
    expect(homeDef).toBeTruthy()
    let savedKey = ''
    let draftCalls = 0

    const result = await persistBuilderPage(
      'home',
      homeDef!,
      [],
      { heroTitle: 'Ana Sayfa' },
      {
        saveDraft: async () => {
          draftCalls += 1
          return draftState()
        },
        publish: async () => {
          throw new Error('publish should not run for non-pilot save')
        },
        updatePageContent: async (key, content) => {
          savedKey = key
          expect(content).toMatchObject({ heroTitle: 'Ana Sayfa' })
          return content
        },
      },
    )

    expect(draftCalls).toBe(0)
    expect(savedKey).toBe(homeDef!.contentKey)
    expect(result.kind).toBe('page-content')
  })
})

describe('publishBuilderPilotPage', () => {
  it('calls the admin publish endpoint only for about', async () => {
    let publishedKey = ''
    const published = await publishBuilderPilotPage('about', {
      publish: async (pageKey) => {
        publishedKey = pageKey
        return { state: draftState(), revisionCreated: true, revision: 3 }
      },
    })
    expect(publishedKey).toBe('about')
    expect(published.revision).toBe(3)
  })

  it('does not publish non-pilot pages through the admin endpoint', async () => {
    let called = 0
    await expect(
      publishBuilderPilotPage('home', {
        publish: async () => {
          called += 1
          return { state: draftState(), revisionCreated: false, revision: null }
        },
      }),
    ).rejects.toThrow(/kalıcı yayın/)
    expect(called).toBe(0)
  })
})

describe('about draft preview source', () => {
  it('reads about preview from the admin draft endpoint', () => {
    expect(resolveBuilderPreviewDataSource('about')).toBe('admin-builder-draft')
    expect(canOpenAboutDraftPreview({ hasBuilderRecord: true })).toBe(true)
    expect(canOpenAboutDraftPreview({ hasBuilderRecord: false })).toBe(false)
  })

  it('keeps other builder previews on public page-content', () => {
    expect(resolveBuilderPreviewDataSource('home')).toBe('public-page-content')
    expect(resolveBuilderPreviewDataSource('services')).toBe('public-page-content')
    expect(resolveBuilderPreviewDataSource('contact')).toBe('public-page-content')
  })
})

describe('dirty snapshot helpers', () => {
  it('treats successful save snapshots as clean regardless of key order', () => {
    const before = { title: 'A', blocks: [{ id: '1' }] }
    const after = { blocks: [{ id: '1' }], title: 'A' }
    expect(payloadsDiffer(before, after)).toBe(false)
    expect(stableStringify(before)).toBe(stableStringify(after))
  })

  it('marks unpublished about changes when draft and published differ', () => {
    expect(
      hasUnpublishedAboutChanges(
        draftState({
          draftContent: { title: 'Yeni' },
          publishedContent: { title: 'Eski' },
        }),
      ),
    ).toBe(true)
    expect(
      hasUnpublishedAboutChanges(
        draftState({
          draftContent: { title: 'Aynı' },
          publishedContent: { title: 'Aynı' },
        }),
      ),
    ).toBe(false)
  })
})

describe('about load error preserves editor', () => {
  it('keeps current about editor content on reload failure', () => {
    expect(
      shouldKeepAboutEditorOnLoadError({
        previousPageKey: 'about',
        nextPageKey: 'about',
        blockCount: 3,
        status: 'ready',
      }),
    ).toBe(true)
  })

  it('does not keep a different page’s editor as about content', () => {
    expect(
      shouldKeepAboutEditorOnLoadError({
        previousPageKey: 'home',
        nextPageKey: 'about',
        blockCount: 3,
        status: 'ready',
      }),
    ).toBe(false)
  })
})
