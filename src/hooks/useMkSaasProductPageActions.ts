import { useEffect, useState } from 'react'
import { addToCart } from '@/lib/cartStorage'
import type { PublicProductDetail } from '@/types/product'
import {
  buildCartSnapshot,
  canPurchaseProduct,
  isSaasSubscriptionProduct,
} from '@/utils/productPurchase'
import { trackAddToCart, trackViewContent } from '@/integrations/trackingEvents'

/** Müvekkil Kasa SaaS yeni satın alması her zaman ürün kaydındaki 1 yıllık fiyattan, 1 yıllık abonelik olarak yapılır. */
const MK_SAAS_PURCHASE_YEARS = 1

export function useMkSaasProductPageActions(product: PublicProductDetail | null | undefined) {
  const webUsageYears = MK_SAAS_PURCHASE_YEARS
  const [feedback, setFeedback] = useState<'added' | 'in-cart' | null>(null)
  const [demoOpen, setDemoOpen] = useState(false)

  const canPurchase = product ? canPurchaseProduct(product) : false
  const isSaas = product ? isSaasSubscriptionProduct(product.productType) : false

  useEffect(() => {
    if (!product) return
    trackViewContent({
      id: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
    })
  }, [product])

  const handleAddToCart = () => {
    if (!product || !canPurchase) return
    const snapshot = buildCartSnapshot(product)
    if (isSaas) {
      addToCart(product.id, webUsageYears, { snapshot, replaceLine: true })
      setFeedback('added')
      trackAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        quantity: webUsageYears,
      })
      return
    }
    const result = addToCart(product.id, 1, { snapshot, replaceLine: true })
    setFeedback(result === 'already_in_cart' ? 'in-cart' : 'added')
    if (result === 'added') {
      trackAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        quantity: 1,
      })
    }
  }

  return {
    product,
    webUsageYears,
    onWebUsageYearsChange: (_years: number) => {},
    feedback,
    onFeedbackDismiss: () => setFeedback(null),
    onAddToCart: handleAddToCart,
    demoOpen,
    onOpenDemo: () => setDemoOpen(true),
    onCloseDemo: () => setDemoOpen(false),
    canPurchase,
  }
}
