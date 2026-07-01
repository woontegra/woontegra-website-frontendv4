import { useRouteError } from 'react-router-dom'
import { ChunkErrorFallback } from '@/components/common/ChunkErrorFallback'

export function AppRouteErrorBoundary() {
  const error = useRouteError()
  return <ChunkErrorFallback error={error} />
}
