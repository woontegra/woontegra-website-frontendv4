import { useEffect } from 'react'
import { useToastStore } from '@/store/toastStore'
import { cn } from '@/lib/cn'

export function AppToast() {
  const message = useToastStore((s) => s.message)
  const variant = useToastStore((s) => s.variant)
  const clear = useToastStore((s) => s.clear)

  useEffect(() => {
    if (!message) return
    const t = window.setTimeout(clear, 4000)
    return () => window.clearTimeout(t)
  }, [message, clear])

  if (!message) return null

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100]">
      <div
        className={cn(
          'pointer-events-auto rounded-lg px-4 py-3 text-sm font-medium shadow-lg',
          variant === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white',
        )}
        role="status"
      >
        {message}
      </div>
    </div>
  )
}
