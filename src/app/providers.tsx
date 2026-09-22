import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import {
  DEFAULT_PUBLIC_SITE_SETTINGS,
  PUBLIC_SITE_SETTINGS_QUERY_KEY,
} from '@/hooks/usePublicSiteSettings'
import { readPublicBootState } from '@/lib/publicBootState'
import { router } from '@/routes/router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
})

const publicBoot = readPublicBootState()
if (publicBoot?.logo) {
  queryClient.setQueryData(PUBLIC_SITE_SETTINGS_QUERY_KEY, {
    ...DEFAULT_PUBLIC_SITE_SETTINGS,
    siteName: publicBoot.siteName || DEFAULT_PUBLIC_SITE_SETTINGS.siteName,
    logo: publicBoot.logo,
    logoUpdatedAt: publicBoot.logoUpdatedAt,
    navbarLogoWidth: publicBoot.navbarLogoWidth,
  })
}

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
