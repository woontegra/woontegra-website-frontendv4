import { useQuery } from '@tanstack/react-query'
import { customersService } from '@/services/customersService'

export function useCustomerLicenses() {
  return useQuery({
    queryKey: ['customer', 'licenses'],
    queryFn: () => customersService.listLicenses(),
  })
}
