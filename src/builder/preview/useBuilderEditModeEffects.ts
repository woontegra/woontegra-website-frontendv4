import { useLayoutEffect, type RefObject } from 'react'

/**
 * Edit modunda public içeriğin kullanıcı etkileşimini durdurur (render değiştirmeden).
 * — video autoplay durdurulur
 * — form submit engellenir
 */
export function useBuilderEditModeEffects(
  containerRef: RefObject<HTMLElement | null>,
  dependencyKey: string,
): void {
  useLayoutEffect(() => {
    const root = containerRef.current
    if (!root) return

    const pauseMedia = () => {
      root.querySelectorAll('video').forEach((video) => {
        video.autoplay = false
        video.pause()
      })
    }

    pauseMedia()

    const observer = new MutationObserver(pauseMedia)
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] })

    const blockSubmit = (event: Event) => {
      event.preventDefault()
      event.stopPropagation()
    }

    root.addEventListener('submit', blockSubmit, true)

    return () => {
      observer.disconnect()
      root.removeEventListener('submit', blockSubmit, true)
    }
  }, [containerRef, dependencyKey])
}
