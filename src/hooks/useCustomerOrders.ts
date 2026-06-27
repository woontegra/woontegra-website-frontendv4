import { useQueries, useQuery } from '@tanstack/react-query'
import type { CustomerOrderDetail } from '@/types/customerOrders'
import { customersService } from '@/services/customersService'
import { isPaidLikeOrder } from '@/lib/accountHelpers'

export function useCustomerOrders() {
  return useQuery({
    queryKey: ['customer', 'orders'],
    queryFn: () => customersService.listOrders(),
  })
}

export function useCustomerPaidOrderDetails() {
  const ordersQuery = useCustomerOrders()
  const paidOrderNos = (ordersQuery.data ?? [])
    .filter((o) => isPaidLikeOrder(o.status))
    .map((o) => o.orderNo)

  const detailsQueries = useQueries({
    queries: paidOrderNos.map((orderNo) => ({
      queryKey: ['customer', 'orders', orderNo],
      queryFn: () => customersService.getOrder(orderNo),
      staleTime: 60_000,
    })),
  })

  const details = detailsQueries
    .map((q) => q.data)
    .filter((d): d is CustomerOrderDetail => Boolean(d))
  const isLoading = ordersQuery.isLoading || detailsQueries.some((q) => q.isLoading)
  const isError = ordersQuery.isError

  return {
    orders: ordersQuery.data ?? [],
    details,
    isLoading,
    isError,
    error: ordersQuery.error,
    refetch: ordersQuery.refetch,
  }
}
