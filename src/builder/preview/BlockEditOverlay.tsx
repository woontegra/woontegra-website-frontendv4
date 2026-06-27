import { blockTypeLabel } from '@/builder/admin/BlockLibraryPanel'
import type { BuilderBlock } from '@/builder/types'
import { cn } from '@/lib/cn'

type Props = {
  block: BuilderBlock
  index: number
  total: number
  selected: boolean
  hovered: boolean
  onHover: (active: boolean) => void
  onSelect: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onToggleHidden: () => void
  onRemove: () => void
  showToolbar?: boolean
}

/**
 * Public render'ın üstündeki şeffaf düzenleme katmanı.
 * Tüm pointer olayları burada yakalanır; altındaki link/buton/form etkileşime girmez.
 */
export function BlockEditOverlay({
  block,
  index,
  total,
  selected,
  hovered,
  onHover,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onToggleHidden,
  onRemove,
  showToolbar = true,
}: Props) {
  const hidden = !block.visibility.enabled
  const showChrome = selected || hovered

  return (
    <>
      <div
        className={cn(
          'absolute inset-0 z-10 cursor-default',
          selected && 'bg-blue-500/[0.04] ring-2 ring-inset ring-blue-500',
          !selected && hovered && 'ring-1 ring-inset ring-sky-400/90',
        )}
        data-builder-overlay-for={block.id}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onSelect()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`${blockTypeLabel(block.type)} bloğunu seç`}
        aria-pressed={selected}
      />

      {showChrome ? (
        <div className="pointer-events-none absolute left-3 top-3 z-20 flex gap-1.5">
          <span className="rounded-md bg-slate-900/85 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm">
            {blockTypeLabel(block.type)}
          </span>
          {hidden ? (
            <span className="rounded-md bg-slate-600/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Gizli
            </span>
          ) : null}
        </div>
      ) : null}

      {showChrome && showToolbar ? (
        <div
          className="absolute right-3 top-3 z-20 flex items-center gap-0.5 rounded-lg border border-slate-200/90 bg-white/95 p-0.5 shadow-md backdrop-blur-sm"
          onMouseEnter={() => onHover(true)}
        >
          <ToolbarBtn label="↑" title="Yukarı taşı" disabled={index === 0} onClick={onMoveUp} />
          <ToolbarBtn label="↓" title="Aşağı taşı" disabled={index === total - 1} onClick={onMoveDown} />
          <ToolbarDivider />
          <ToolbarBtn label="Çoğalt" onClick={onDuplicate} />
          <ToolbarBtn label={hidden ? 'Göster' : 'Gizle'} onClick={onToggleHidden} />
          <ToolbarBtn label="Sil" danger onClick={onRemove} />
          <ToolbarDivider />
          <ToolbarBtn label="Ayarlar" primary onClick={onSelect} />
        </div>
      ) : null}
    </>
  )
}

function ToolbarDivider() {
  return <span className="mx-0.5 h-4 w-px bg-slate-200" aria-hidden />
}

function ToolbarBtn({
  label,
  onClick,
  disabled,
  danger,
  primary,
  title,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  primary?: boolean
  title?: string
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        'pointer-events-auto rounded-md px-2 py-1 text-[11px] font-medium transition',
        danger && 'text-red-600 hover:bg-red-50',
        primary && 'text-blue-700 hover:bg-blue-50',
        !danger && !primary && 'text-slate-600 hover:bg-slate-100',
        disabled && 'cursor-not-allowed opacity-30',
      )}
    >
      {label}
    </button>
  )
}
