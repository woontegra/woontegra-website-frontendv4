import { adminApi, publicApi } from '@/api/client'
import { unwrapApiData } from '@/types/api'
import {
  analyticsFromAdminRaw,
  buildAnalyticsFlatPatch,
  type AnalyticsSettings,
  type AnalyticsSettingsSaveInput,
  type PublicAnalyticsConfig,
  parsePublicAnalyticsJsonString,
} from '@/types/analyticsSettings'

function unwrapSettingsPayload(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const inner = (raw as { data: unknown }).data
    if (inner && typeof inner === 'object') return inner as Record<string, unknown>
  }
  if (raw && typeof raw === 'object') return raw as Record<string, unknown>
  return {}
}

export const trackingSettingsService = {
  async getAdmin(): Promise<AnalyticsSettings> {
    const res = await adminApi.get<unknown>('/settings/admin')
    return analyticsFromAdminRaw(unwrapSettingsPayload(res.data))
  },

  async update(input: AnalyticsSettingsSaveInput): Promise<AnalyticsSettings> {
    const patch = buildAnalyticsFlatPatch(input)
    await adminApi.patch('/settings', patch)
    return this.getAdmin()
  },
}

export type PublicTrackingPayload = {
  googleAnalyticsId: string
  googleTagManagerId: string
  metaPixelId: string
  metaBrowserPixelEnabled: boolean
  analyticsPublic: PublicAnalyticsConfig | null
}

export const publicTrackingService = {
  async getPublic(): Promise<PublicTrackingPayload> {
    const res = await publicApi.get<unknown>('/settings/tracking')
    let raw: Record<string, unknown>
    try {
      raw = unwrapApiData(res.data, 'settings.tracking') as Record<string, unknown>
    } catch {
      raw = (res.data && typeof res.data === 'object' ? res.data : {}) as Record<string, unknown>
    }
    const analyticsPublic = parsePublicAnalyticsJsonString(String(raw.analyticsPublicJson ?? ''))

    return {
      googleAnalyticsId: String(raw.googleAnalyticsId ?? ''),
      googleTagManagerId: String(raw.googleTagManagerId ?? ''),
      metaPixelId: String(raw.metaPixelId ?? ''),
      metaBrowserPixelEnabled: raw.metaBrowserPixelEnabled === true || raw.metaBrowserPixelEnabled === 'true',
      analyticsPublic,
    }
  },
}
