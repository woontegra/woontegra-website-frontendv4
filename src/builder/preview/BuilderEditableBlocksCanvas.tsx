import { useRef, useState } from 'react'
import { PageBlocksRenderer } from '@/builder/render/PageBlocksRenderer'
import { BlockEditOverlay } from '@/builder/preview/BlockEditOverlay'
import { FieldOverlayLayer } from '@/builder/preview/FieldOverlayLayer'
import { useBuilderEditModeEffects } from '@/builder/preview/useBuilderEditModeEffects'
import { BuilderEditProvider } from '@/builder/edit/BuilderEditContext'
import { useBuilderStore } from '@/builder/store/builderStore'
import type { BuilderBlock } from '@/builder/types'
import { cn } from '@/lib/cn'

const PUBLIC_LAYER_CLASS =
  'pointer-events-none select-none [&_*]:pointer-events-none [&_*]:select-none [&_a]:cursor-default [&_button]:cursor-default'

export function BuilderEditableBlocksCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const blocks = useBuilderStore((s) => s.blocks)
  const selectedBlockId = useBuilderStore((s) => s.selectedBlockId)
  const selectedFieldPath = useBuilderStore((s) => s.selectedFieldPath)
  const selectBlock = useBuilderStore((s) => s.selectBlock)
  const selectField = useBuilderStore((s) => s.selectField)
  const moveBlock = useBuilderStore((s) => s.moveBlock)
  const duplicateBlock = useBuilderStore((s) => s.duplicateBlock)
  const removeBlock = useBuilderStore((s) => s.removeBlock)
  const updateBlock = useBuilderStore((s) => s.updateBlock)

  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null)
  const [hoveredFieldPath, setHoveredFieldPath] = useState<string | null>(null)

  const sorted = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder)
  const dependencyKey = sorted.map((b) => `${b.id}:${JSON.stringify(b)}`).join('|')

  useBuilderEditModeEffects(canvasRef, dependencyKey)

  if (sorted.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center bg-white px-6 py-16 text-center">
        <p className="text-sm font-medium text-slate-700">Builder JSON yüklendi ancak blok listesi boş.</p>
        <p className="mt-1 text-xs text-slate-400">Soldan blok ekleyerek düzenlemeye başlayın.</p>
      </div>
    )
  }

  return (
    <BuilderEditProvider annotateFields>
      <div
        ref={canvasRef}
        data-builder-edit-mode
        data-builder-canvas
        className="relative bg-white"
        onMouseLeave={() => {
          setHoveredBlockId(null)
          setHoveredFieldPath(null)
        }}
      >
        {sorted.map((block, index) => (
          <BuilderBlockSlot
            key={block.id}
            block={block}
            index={index}
            total={sorted.length}
            selected={block.id === selectedBlockId}
            blockHovered={block.id === hoveredBlockId}
            selectedFieldPath={block.id === selectedBlockId ? selectedFieldPath : null}
            hoveredFieldPath={block.id === hoveredBlockId ? hoveredFieldPath : null}
            hidden={!block.visibility.enabled}
            onBlockHover={(active) => setHoveredBlockId(active ? block.id : null)}
            onFieldHover={setHoveredFieldPath}
            onSelectBlock={() => selectBlock(block.id)}
            onSelectField={(path) => selectField(block.id, path)}
            onMoveUp={() => moveBlock(block.id, 'up')}
            onMoveDown={() => moveBlock(block.id, 'down')}
            onDuplicate={() => duplicateBlock(block.id)}
            onToggleHidden={() =>
              updateBlock(block.id, {
                visibility: { ...block.visibility, enabled: !block.visibility.enabled },
              })
            }
            onRemove={() => removeBlock(block.id)}
          />
        ))}
      </div>
    </BuilderEditProvider>
  )
}

function BuilderBlockSlot({
  block,
  index,
  total,
  selected,
  blockHovered,
  selectedFieldPath,
  hoveredFieldPath,
  hidden,
  onBlockHover,
  onFieldHover,
  onSelectBlock,
  onSelectField,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onToggleHidden,
  onRemove,
}: {
  block: BuilderBlock
  index: number
  total: number
  selected: boolean
  blockHovered: boolean
  selectedFieldPath: string | null
  hoveredFieldPath: string | null
  hidden: boolean
  onBlockHover: (active: boolean) => void
  onFieldHover: (path: string | null) => void
  onSelectBlock: () => void
  onSelectField: (path: string) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onToggleHidden: () => void
  onRemove: () => void
}) {
  const slotRef = useRef<HTMLDivElement>(null)
  const fieldActive = Boolean(selectedFieldPath || hoveredFieldPath)
  const scanKey = `${block.id}-${block.sortOrder}-${JSON.stringify(block)}`

  return (
    <div
      ref={slotRef}
      className={cn(
        'relative',
        selected && 'z-[2]',
        !selected && blockHovered && 'z-[1]',
        hidden && 'opacity-60',
      )}
      data-builder-block-slot={block.id}
    >
      <div className={PUBLIC_LAYER_CLASS} aria-hidden="true">
        <PageBlocksRenderer blocks={[block]} mode="public" annotateBlocks />
      </div>

      <BlockEditOverlay
        block={block}
        index={index}
        total={total}
        selected={selected && !selectedFieldPath}
        hovered={blockHovered && !fieldActive}
        onHover={onBlockHover}
        onSelect={onSelectBlock}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDuplicate={onDuplicate}
        onToggleHidden={onToggleHidden}
        onRemove={onRemove}
        showToolbar={selected && !selectedFieldPath}
      />

      <FieldOverlayLayer
        slotRef={slotRef}
        blockId={block.id}
        scanKey={scanKey}
        selectedFieldPath={selectedFieldPath}
        hoveredFieldPath={hoveredFieldPath}
        onFieldHover={(path) => {
          onFieldHover(path)
          if (path) onBlockHover(true)
        }}
        onFieldSelect={onSelectField}
      />
    </div>
  )
}
