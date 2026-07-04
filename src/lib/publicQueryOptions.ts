export const PUBLIC_STALE_MS = 5 * 60_000
export const PUBLIC_GC_MS = 30 * 60_000

export const publicQueryOptions = {
  staleTime: PUBLIC_STALE_MS,
  gcTime: PUBLIC_GC_MS,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 1,
  retryDelay: 400,
} as const
