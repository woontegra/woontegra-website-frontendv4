import { useCallback, useLayoutEffect, useState, type RefObject } from 'react'
import { cn } from '@/lib/cn'

type FieldRect = {
  path: string
  label: string
  type: string
  top: number
  left: number
  width: number
  height: number
}

type Props = {
  slotRef: RefObject<HTMLElement | null>
  blockId: string
  scanKey: string
  selectedFieldPath: string | null
  hoveredFieldPath: string | null
  onFieldHover: (path: string | null) => void
  onFieldSelect: (path: string) => void
}

export function FieldOverlayLayer({
  slotRef,
  blockId,
  scanKey,
  selectedFieldPath,
  hoveredFieldPath,
  onFieldHover,
  onFieldSelect,
}: Props) {
  const [rects, setRects] = useState<FieldRect[]>([])

  const scan = useCallback(() => {
    const slot = slotRef.current
    if (!slot) return
    const slotRect = slot.getBoundingClientRect()
    const nodes = slot.querySelectorAll('[data-builder-field-path]')
    const next: FieldRect[] = []

    nodes.forEach((node) => {
      const el = node as HTMLElement
      const rect = el.getBoundingClientRect()
      if (rect.width < 1 || rect.height < 1) return

      next.push({
        path: el.dataset.builderFieldPath ?? '',
        label: el.dataset.builderFieldLabel ?? '',
        type: el.dataset.builderFieldType ?? 'text',
        top: rect.top - slotRect.top + slot.scrollTop,
        left: rect.left - slotRect.left + slot.scrollLeft,
        width: rect.width,
        height: rect.height,
      })
    })

    setRects(next)
  }, [slotRef])

  useLayoutEffect(() => {
    scan()
    const slot = slotRef.current
    if (!slot) return

    const ro = new ResizeObserver(scan)
    ro.observe(slot)
    slot.querySelectorAll('[data-builder-field-path]').forEach((el) => ro.observe(el))

    const onScroll = () => scan()
    window.addEventListener('resize', scan)
    slot.addEventListener('scroll', onScroll, true)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', scan)
      slot.removeEventListener('scroll', onScroll, true)
    }
  }, [scan, scanKey, slotRef])

  return (
    <>
      {rects.map((rect) => {
        const selected = selectedFieldPath === rect.path
        const hovered = hoveredFieldPath === rect.path

        return (
          <div
            key={`${blockId}-${rect.path}`}
            className={cn(
              'absolute cursor-pointer',
              rect.type === 'media' ? 'z-[15]' : 'z-[25]',
              selected && 'bg-violet-500/[0.06] ring-2 ring-inset ring-violet-500',
              !selected && hovered && 'ring-1 ring-inset ring-violet-400/90',
            )}
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            }}
            data-builder-field-overlay={rect.path}
            onMouseEnter={() => onFieldHover(rect.path)}
            onMouseLeave={() => onFieldHover(null)}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onFieldSelect(rect.path)
            }}
            role="button"
            tabIndex={-1}
            aria-label={`${rect.label} alanını düzenle`}
          >
            {hovered || selected ? (
              <span
                className={cn(
                  'pointer-events-none absolute -top-2 left-0 z-30 -translate-y-full rounded px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm',
                  selected ? 'bg-violet-600' : 'bg-violet-500/90',
                )}
              >
                {rect.label}
              </span>
            ) : null}
          </div>
        )
      })}
    </>
  )
}
