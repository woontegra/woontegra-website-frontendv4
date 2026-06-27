import { useQuery } from '@tanstack/react-query'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { publicTrackingService } from '@/services/trackingSettingsService'
import { DEFAULT_ANALYTICS_SETTINGS, type PublicAnalyticsConfig } from '@/types/analyticsSettings'

function buildFallbackConfig(payload: Awaited<ReturnType<typeof publicTrackingService.getPublic>>): PublicAnalyticsConfig {
  const base = DEFAULT_ANALYTICS_SETTINGS
  const gaId = payload.googleAnalyticsId.trim()
  const gtmId = payload.googleTagManagerId.trim()
  const pixelId = payload.metaPixelId.trim()

  return {
    googleAnalytics: {
      ...base.googleAnalytics,
      enabled: Boolean(gaId),
      measurementId: gaId,
    },
    googleTagManager: {
      ...base.googleTagManager,
      enabled: Boolean(gtmId),
      containerId: gtmId,
    },
    searchConsole: base.searchConsole,
    metaPixel: {
      ...base.metaPixel,
      enabled: payload.metaBrowserPixelEnabled && Boolean(pixelId),
      pixelId,
    },
    events: base.events,
  }
}

export function usePublicTrackingSettings() {
  return useQuery({
    queryKey: ['public', 'trackingSettings'],
    queryFn: () => publicTrackingService.getPublic(),
    ...publicQueryOptions,
    select: (payload) => payload.analyticsPublic ?? buildFallbackConfig(payload),
  })
}

export function usePublicAnalyticsConfig(): PublicAnalyticsConfig | undefined {
  return usePublicTrackingSettings().data
}
