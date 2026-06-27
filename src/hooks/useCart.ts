import { useEffect, useState } from 'react'
import { cartItemCount, readCart } from '@/lib/cartStorage'

export function useCart() {
  const [count, setCount] = useState(() => cartItemCount())

  useEffect(() => {
    const sync = () => setCount(cartItemCount())
    sync()
    window.addEventListener('woontegra-cart', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('woontegra-cart', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return { count, lines: readCart() }
}
