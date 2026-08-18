import { create } from 'zustand'
import type { BuilderBlock } from '@/builder/types'
import { BLOCK_TYPE_LABELS, createBlockByType, isUniqueBlockType, type MvpBlockTypeId } from '@/builder/types'
import {
  getBuilderPageDefinition,
  resolveBuilderPageKey,
} from '@/builder/pages/builderPageRegistry'
import { resolveBuilderPageLoad } from '@/builder/load/resolveBuilderPageLoad'
import type { PageLoadSource, BuilderCanvasMode } from '@/builder/load/resolveBuilderPageLoad'
import { convertPageToBlocks } from '@/builder/load/convertPageToBlocks'
import { sanitizeMkCompareBuilderBlocks, isAutoMkCompareLegacyDocument } from '@/builder/templates/mkCompareBuilderTemplate'
import { isMkCompareBuilderPageKey } from '@/components/public/muvekkil-kasa/comparePageUtils'
import type { ConversionReport } from '@/builder/load/conversionReport'
import { enrichParityRaw } from '@/builder/parity/enrichParityRaw'
import { pageContentService, getErrorMessage } from '@/services/pageContentService'
import { adminBuilderPagesService, getBuilderPagesErrorMessage } from '@/services/adminBuilderPagesService'
import { extractBlocksForPage } from '@/builder/load/pageContentPersistence'
import { isAboutBuilderPilotPage } from '@/builder/pilot/aboutBuilderPilot'
import { resolveAboutPilotBlocks, hasUnpublishedAboutChanges, shouldKeepAboutEditorOnLoadError } from '@/builder/pilot/aboutPilotLoad'
import { persistBuilderPage, publishBuilderPilotPage, buildCurrentPagePayload } from '@/builder/pilot/builderPersist'
import { stableStringify } from '@/builder/pilot/stablePayload'
import type { BuilderPageStateDto, BuilderRevisionListItemDto } from '@/types/builderPages'
import { useToastStore } from '@/store/toastStore'

export const BUILDER_DRAFT_STORAGE_PREFIX = 'woontegra_builder_draft_v1'
const MAX_HISTORY = 40

export type BuilderPageState = {
  pageKey: string
  pageTitle: string
  blocks: BuilderBlock[]
}

export type BuilderDraftPayload = BuilderPageState & {
  savedAt: string
}

export type LoadPageStatus = 'idle' | 'loading' | 'ready' | 'error'

type HistoryEntry = BuilderPageState

type BuilderStore = BuilderPageState & {
  selectedBlockId: string | null
  selectedFieldPath: string | null
  lastSavedAt: string | null
  isDirty: boolean
  canUndo: boolean
  canRedo: boolean
  loadPageStatus: LoadPageStatus
  loadPageError: string | null
  pageLoadSource: PageLoadSource | null
  canvasMode: BuilderCanvasMode
  previewPath: string
  pageRawContent: Record<string, unknown> | null
  conversionReport: ConversionReport | null
  isSaving: boolean
  saveError: string | null
  isPublishing: boolean
  persistSnapshot: string | null
  persistMeta: {
    hasBuilderRecord: boolean
    draftUpdatedAt: string | null
    publishedAt: string | null
    publishedRevision: number | null
    hasUnpublishedChanges: boolean
  } | null
  revisions: BuilderRevisionListItemDto[]
  selectBlock: (id: string | null) => void
  selectField: (blockId: string, fieldPath: string) => void
  convertToBuilderDraft: () => void
  revertToLegacyView: () => void
  addBlock: (type: MvpBlockTypeId) => void
  removeBlock: (id: string) => void
  duplicateBlock: (id: string) => void
  moveBlock: (id: string, direction: 'up' | 'down') => void
  updateBlock: (id: string, patch: Partial<BuilderBlock>) => void
  replaceBlock: (id: string, block: BuilderBlock) => void
  loadPage: (pageKey: string) => Promise<void>
  saveDraftLocal: () => void
  savePageToApi: () => Promise<boolean>
  publishAboutPilot: () => Promise<boolean>
  loadAboutRevisions: () => Promise<void>
  clearDraftLocal: () => void
  exportJson: () => string
  undo: () => void
  redo: () => void
}

const DEFAULT_PAGE: BuilderPageState = {
  pageKey: 'home',
  pageTitle: 'Ana Sayfa',
  blocks: [],
}

let history: HistoryEntry[] = []
let historyIndex = -1

function draftStorageKey(pageKey: string): string {
  return `${BUILDER_DRAFT_STORAGE_PREFIX}:${pageKey}`
}

function readLocalDraft(pageKey: string): BuilderDraftPayload | null {
  try {
    const raw = localStorage.getItem(draftStorageKey(pageKey))
    if (!raw) return null
    const parsed = JSON.parse(raw) as BuilderDraftPayload
    if (!Array.isArray(parsed.blocks) || parsed.blocks.length === 0) return null
    return parsed
  } catch {
    return null
  }
}

function clonePageState(state: BuilderPageState): HistoryEntry {
  return JSON.parse(JSON.stringify(state)) as HistoryEntry
}

function reorder(blocks: BuilderBlock[]): BuilderBlock[] {
  return blocks.map((b, i) => ({ ...b, sortOrder: i }))
}

function cloneBlock(block: BuilderBlock, sortOrder: number): BuilderBlock {
  const copy = JSON.parse(JSON.stringify(block)) as BuilderBlock
  copy.id = `${block.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  copy.sortOrder = sortOrder
  return copy
}

function syncHistoryFlags(set: (partial: Partial<BuilderStore>) => void) {
  set({
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  })
}

function pushHistory(get: () => BuilderStore, set: (partial: Partial<BuilderStore>) => void) {
  const snap = clonePageState({
    pageKey: get().pageKey,
    pageTitle: get().pageTitle,
    blocks: get().blocks,
  })
  history = history.slice(0, historyIndex + 1)
  history.push(snap)
  if (history.length > MAX_HISTORY) {
    history.shift()
  } else {
    historyIndex += 1
  }
  syncHistoryFlags(set)
}

function applySnapshot(snap: HistoryEntry, set: (partial: Partial<BuilderStore>) => void) {
  set({
    pageKey: snap.pageKey,
    pageTitle: snap.pageTitle,
    blocks: snap.blocks,
    isDirty: true,
    selectedBlockId: null,
    selectedFieldPath: null,
  })
}

function initHistory(state: BuilderPageState) {
  history = [clonePageState(state)]
  historyIndex = 0
}

function applyLoadedPage(
  loaded: BuilderPageState & {
    source: PageLoadSource
    canvasMode: BuilderCanvasMode
    previewPath: string
  },
  set: (partial: Partial<BuilderStore>) => void,
) {
  initHistory(loaded)
  set({
    pageKey: loaded.pageKey,
    pageTitle: loaded.pageTitle,
    blocks: loaded.blocks,
    selectedBlockId: null,
    selectedFieldPath: null,
    isDirty: false,
    lastSavedAt: null,
    loadPageStatus: 'ready',
    loadPageError: null,
    pageLoadSource: loaded.source,
    canvasMode: loaded.canvasMode,
    previewPath: loaded.previewPath,
    conversionReport: null,
  })
  syncHistoryFlags(set)
}

function emptyPersistMeta() {
  return {
    hasBuilderRecord: false,
    draftUpdatedAt: null as string | null,
    publishedAt: null as string | null,
    publishedRevision: null as number | null,
    hasUnpublishedChanges: false,
  }
}

function persistMetaFromState(state: BuilderPageStateDto) {
  return {
    hasBuilderRecord: state.hasBuilderRecord,
    draftUpdatedAt: state.draftUpdatedAt,
    publishedAt: state.publishedAt,
    publishedRevision: state.publishedRevision,
    hasUnpublishedChanges: hasUnpublishedAboutChanges(state),
  }
}

function snapshotFromPayload(def: NonNullable<ReturnType<typeof getBuilderPageDefinition>>, blocks: BuilderBlock[], raw: Record<string, unknown> | null) {
  return stableStringify(buildCurrentPagePayload(def, blocks, raw))
}

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  ...DEFAULT_PAGE,
  selectedBlockId: null,
  selectedFieldPath: null,
  lastSavedAt: null,
  isDirty: false,
  canUndo: false,
  canRedo: false,
  loadPageStatus: 'idle',
  loadPageError: null,
  pageLoadSource: null,
  canvasMode: 'legacy-public',
  previewPath: '/',
  pageRawContent: null,
  conversionReport: null,
  isSaving: false,
  saveError: null,
  isPublishing: false,
  persistSnapshot: null,
  persistMeta: null,
  revisions: [],

  selectBlock: (id) => set({ selectedBlockId: id, selectedFieldPath: null }),

  selectField: (blockId, fieldPath) =>
    set({ selectedBlockId: blockId, selectedFieldPath: fieldPath }),

  convertToBuilderDraft: () => {
    const { pageKey, pageTitle, pageRawContent } = get()
    const def = getBuilderPageDefinition(pageKey)
    if (!def) return

    void (async () => {
      const enriched = await enrichParityRaw(def, pageRawContent)
      const raw = enriched ?? pageRawContent
      const existing = extractBlocksForPage(raw, def)
      const usable =
        isMkCompareBuilderPageKey(def.key) && existing
          ? sanitizeMkCompareBuilderBlocks(existing)
          : existing
      if (usable?.length) {
        const nextState: BuilderPageState = { pageKey, pageTitle, blocks: usable }
        initHistory(nextState)
        set({
          blocks: usable,
          canvasMode: 'builder-blocks',
          pageLoadSource: 'builder-draft',
          conversionReport: null,
          isDirty: Boolean(existing && isAutoMkCompareLegacyDocument(existing)),
          selectedBlockId: usable[0]?.id ?? null,
          selectedFieldPath: null,
          loadPageStatus: 'ready',
          pageRawContent: raw,
        })
        syncHistoryFlags(set)
        return
      }

      const { blocks, report } = convertPageToBlocks(def, raw)
      if (blocks.length === 0) return

      const nextState: BuilderPageState = { pageKey, pageTitle, blocks }
      initHistory(nextState)

      set({
        blocks,
        canvasMode: 'builder-blocks',
        pageLoadSource: 'builder-draft',
        conversionReport: report,
        isDirty: true,
        selectedBlockId: blocks[0]?.id ?? null,
        selectedFieldPath: null,
        loadPageStatus: 'ready',
        pageRawContent: raw,
      })
      syncHistoryFlags(set)
    })()
  },

  revertToLegacyView: () => {
    const { pageKey, pageTitle } = get()
    const nextState: BuilderPageState = { pageKey, pageTitle, blocks: [] }
    initHistory(nextState)
    localStorage.removeItem(draftStorageKey(pageKey))
    set({
      blocks: [],
      canvasMode: 'legacy-public',
      pageLoadSource: 'legacy-public',
      conversionReport: null,
      isDirty: false,
      lastSavedAt: null,
      selectedBlockId: null,
      selectedFieldPath: null,
    })
    syncHistoryFlags(set)
  },

  addBlock: (type) => {
    pushHistory(get, set)
    const { blocks } = get()
    if (isUniqueBlockType(type) && blocks.some((b) => b.type === type)) {
      const label = BLOCK_TYPE_LABELS[type]
      useToastStore.getState().show(`Sayfada yalnızca bir ${label} bloğu olabilir.`, 'error')
      return
    }
    const next = createBlockByType(type, blocks.length)
    set({
      blocks: [...blocks, next],
      selectedBlockId: next.id,
      isDirty: true,
    })
  },

  removeBlock: (id) => {
    pushHistory(get, set)
    const { blocks, selectedBlockId } = get()
    const next = reorder(blocks.filter((b) => b.id !== id))
    set({
      blocks: next,
      selectedBlockId: selectedBlockId === id ? null : selectedBlockId,
      isDirty: true,
    })
  },

  duplicateBlock: (id) => {
    pushHistory(get, set)
    const { blocks } = get()
    const idx = blocks.findIndex((b) => b.id === id)
    if (idx < 0) return
    if (isUniqueBlockType(blocks[idx].type)) {
      useToastStore.getState().show('Bu blok güvenlik nedeniyle çoğaltılamaz.', 'error')
      return
    }
    const copy = cloneBlock(blocks[idx], idx + 1)
    const next = [...blocks.slice(0, idx + 1), copy, ...blocks.slice(idx + 1)]
    set({ blocks: reorder(next), selectedBlockId: copy.id, isDirty: true })
  },

  moveBlock: (id, direction) => {
    pushHistory(get, set)
    const { blocks } = get()
    const idx = blocks.findIndex((b) => b.id === id)
    if (idx < 0) return
    const target = direction === 'up' ? idx - 1 : idx + 1
    if (target < 0 || target >= blocks.length) return
    const next = [...blocks]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    set({ blocks: reorder(next), isDirty: true })
  },

  updateBlock: (id, patch) => {
    set({
      blocks: get().blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as BuilderBlock) : b)),
      isDirty: true,
    })
    if (!isAboutBuilderPilotPage(get().pageKey)) get().saveDraftLocal()
  },

  replaceBlock: (id, block) => {
    set({
      blocks: get().blocks.map((b) => (b.id === id ? block : b)),
      isDirty: true,
    })
    if (!isAboutBuilderPilotPage(get().pageKey)) get().saveDraftLocal()
  },

  loadPage: async (pageKeyInput) => {
    const pageKey = resolveBuilderPageKey(pageKeyInput)
    const def = getBuilderPageDefinition(pageKey)
    if (!def) {
      set({ loadPageStatus: 'error', loadPageError: 'Geçersiz sayfa anahtarı' })
      return
    }

    const previous = get()
    const keepEditorOnError = shouldKeepAboutEditorOnLoadError({
      previousPageKey: previous.pageKey,
      nextPageKey: def.key,
      blockCount: previous.blocks.length,
      status: previous.loadPageStatus,
    })

    set({
      loadPageStatus: 'loading',
      loadPageError: null,
      selectedBlockId: null,
      selectedFieldPath: null,
      pageKey: def.key,
      pageTitle: def.title,
      previewPath: def.previewPath,
      persistMeta: isAboutBuilderPilotPage(def.key) ? previous.persistMeta : null,
      persistSnapshot: isAboutBuilderPilotPage(def.key) ? previous.persistSnapshot : null,
      revisions: isAboutBuilderPilotPage(def.key) ? previous.revisions : [],
    })

    if (isAboutBuilderPilotPage(def.key)) {
      try {
        const state = await adminBuilderPagesService.getState(def.key)
        const { blocks, raw } = resolveAboutPilotBlocks(def, state)
        applyLoadedPage(
          {
            pageKey: def.key,
            pageTitle: def.title,
            blocks,
            source: blocks.length ? 'builder-draft' : 'legacy-public',
            canvasMode: blocks.length ? 'builder-blocks' : 'legacy-public',
            previewPath: def.previewPath,
          },
          set,
        )
        set({
          pageRawContent: raw,
          isDirty: false,
          lastSavedAt: state.draftUpdatedAt,
          persistMeta: persistMetaFromState(state),
          persistSnapshot: snapshotFromPayload(def, blocks, raw),
          loadPageError: null,
        })
      } catch (err) {
        const message = getBuilderPagesErrorMessage(err, 'Sayfa yüklenemedi')
        useToastStore.getState().show(message, 'error')
        if (keepEditorOnError) {
          set({ loadPageStatus: 'ready', loadPageError: message })
          return
        }
        set({
          loadPageStatus: 'error',
          loadPageError: message,
          persistMeta: emptyPersistMeta(),
        })
      }
      return
    }

    try {
      const raw = await pageContentService.getRawByKey(def.contentKey)
      const enriched = await enrichParityRaw(def, raw)
      const resolved = resolveBuilderPageLoad(def, raw)

      set({ pageRawContent: enriched ?? raw })

      const localDraft = readLocalDraft(def.key)
      const draftBlocks =
        localDraft?.blocks?.length && isMkCompareBuilderPageKey(def.key)
          ? sanitizeMkCompareBuilderBlocks(localDraft.blocks)
          : localDraft?.blocks
      if (resolved.canvasMode === 'legacy-public' && draftBlocks?.length) {
        applyLoadedPage(
          {
            pageKey: resolved.pageKey,
            pageTitle: resolved.pageTitle,
            blocks: draftBlocks,
            source: 'builder-draft',
            canvasMode: 'builder-blocks',
            previewPath: def.previewPath,
          },
          set,
        )
        set({
          lastSavedAt: localDraft?.savedAt,
          isDirty:
            isMkCompareBuilderPageKey(def.key) ||
            Boolean(localDraft && isAutoMkCompareLegacyDocument(localDraft.blocks)),
        })
        return
      }

      if (resolved.canvasMode === 'legacy-public' && isMkCompareBuilderPageKey(def.key)) {
        const { blocks, report } = convertPageToBlocks(def, enriched ?? raw)
        if (blocks.length > 0) {
          applyLoadedPage(
            {
              pageKey: def.key,
              pageTitle: def.title,
              blocks,
              source: 'builder-draft',
              canvasMode: 'builder-blocks',
              previewPath: def.previewPath,
            },
            set,
          )
          set({
            isDirty: true,
            conversionReport: report,
            pageRawContent: enriched ?? raw,
          })
          return
        }
      }

      applyLoadedPage(
        {
          pageKey: resolved.pageKey,
          pageTitle: resolved.pageTitle,
          blocks: resolved.blocks,
          source: resolved.source,
          canvasMode: resolved.canvasMode,
          previewPath: def.previewPath,
        },
        set,
      )
      if (resolved.source === 'builder-json') {
        set({ lastSavedAt: new Date().toISOString(), isDirty: false })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sayfa yüklenemedi'
      const fallback = resolveBuilderPageLoad(def, null)
      set({ pageRawContent: null })
      applyLoadedPage(
        {
          pageKey: fallback.pageKey,
          pageTitle: fallback.pageTitle,
          blocks: fallback.blocks,
          source: 'legacy-public',
          canvasMode: 'legacy-public',
          previewPath: def.previewPath,
        },
        set,
      )
      set({ loadPageError: message })
    }
  },

  undo: () => {
    if (historyIndex <= 0) return
    historyIndex -= 1
    applySnapshot(history[historyIndex], set)
    syncHistoryFlags(set)
  },

  redo: () => {
    if (historyIndex >= history.length - 1) return
    historyIndex += 1
    applySnapshot(history[historyIndex], set)
    syncHistoryFlags(set)
  },

  saveDraftLocal: () => {
    const { pageKey, pageTitle, blocks } = get()
    if (isAboutBuilderPilotPage(pageKey)) return
    const savedAt = new Date().toISOString()
    const payload: BuilderDraftPayload = { pageKey, pageTitle, blocks, savedAt }
    localStorage.setItem(draftStorageKey(pageKey), JSON.stringify(payload))
    set({ lastSavedAt: savedAt })
  },

  savePageToApi: async () => {
    const { pageKey, blocks, pageRawContent, canvasMode } = get()
    if (canvasMode !== 'builder-blocks' || blocks.length === 0) return false

    const def = getBuilderPageDefinition(pageKey)
    if (!def) return false
    if (get().isSaving) return false

    set({ isSaving: true, saveError: null })

    try {
      const result = await persistBuilderPage(pageKey, def, blocks, pageRawContent)
      if (result.kind === 'persistent-draft') {
        const savedAt = result.state.draftUpdatedAt ?? new Date().toISOString()
        set({
          pageRawContent: result.state.draftContent,
          isDirty: false,
          isSaving: false,
          lastSavedAt: savedAt,
          pageLoadSource: 'builder-draft',
          saveError: null,
          persistMeta: persistMetaFromState(result.state),
          persistSnapshot: snapshotFromPayload(def, blocks, result.state.draftContent),
        })
        useToastStore.getState().show('Taslak kaydedildi', 'success')
        return true
      }

      const savedAt = new Date().toISOString()
      localStorage.removeItem(draftStorageKey(pageKey))
      set({
        pageRawContent: result.saved,
        isDirty: false,
        isSaving: false,
        lastSavedAt: savedAt,
        pageLoadSource: 'builder-json',
        saveError: null,
      })
      useToastStore.getState().show('Kayıt başarıyla tamamlandı', 'success')
      return true
    } catch (err) {
      const message = isAboutBuilderPilotPage(pageKey)
        ? getBuilderPagesErrorMessage(err, 'Kayıt başarısız')
        : getErrorMessage(err, 'Kayıt başarısız')
      set({ isSaving: false, saveError: message })
      useToastStore.getState().show(message, 'error')
      return false
    }
  },

  publishAboutPilot: async () => {
    const { pageKey, blocks, canvasMode } = get()
    if (!isAboutBuilderPilotPage(pageKey)) return false
    if (canvasMode !== 'builder-blocks' || blocks.length === 0) return false
    if (get().isPublishing || get().isSaving) return false

    const def = getBuilderPageDefinition(pageKey)
    if (!def) return false

    set({ isPublishing: true, saveError: null })
    try {
      const published = await publishBuilderPilotPage(pageKey)
      set({
        isPublishing: false,
        persistMeta: persistMetaFromState(published.state),
        pageRawContent: published.state.draftContent ?? get().pageRawContent,
        lastSavedAt: published.state.draftUpdatedAt ?? get().lastSavedAt,
      })
      useToastStore.getState().show('Hakkımızda sayfası yayına alındı', 'success')
      return true
    } catch (err) {
      const message = getBuilderPagesErrorMessage(err, 'Yayın başarısız')
      set({ isPublishing: false, saveError: message })
      useToastStore.getState().show(message, 'error')
      return false
    }
  },

  loadAboutRevisions: async () => {
    const { pageKey } = get()
    if (!isAboutBuilderPilotPage(pageKey)) return
    try {
      const revisions = await adminBuilderPagesService.listRevisions(pageKey)
      set({ revisions })
    } catch {
      set({ revisions: [] })
      useToastStore.getState().show('Sürüm listesi yüklenemedi', 'error')
    }
  },

  clearDraftLocal: () => {
    const { pageKey } = get()
    localStorage.removeItem(draftStorageKey(pageKey))
    void get().loadPage(pageKey)
  },

  exportJson: () => {
    const { pageKey, pageTitle, blocks } = get()
    return JSON.stringify({ pageKey, pageTitle, blocks }, null, 2)
  },
}))

initHistory(DEFAULT_PAGE)

export { BUILDER_PAGE_GROUPS, BUILDER_PAGE_OPTIONS } from '@/builder/pages/builderPageRegistry'
export type { BuilderPageOption } from '@/builder/pages/builderPageRegistry'
