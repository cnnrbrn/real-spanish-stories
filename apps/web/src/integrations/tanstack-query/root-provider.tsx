import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ApiError } from '@/lib/api'

function handleAuthError(error: unknown) {
  if (
    typeof window === 'undefined' ||
    !(error instanceof ApiError) ||
    error.status !== 401
  ) {
    return
  }
  if (window.location.pathname === '/login') return
  const redirect = encodeURIComponent(
    window.location.pathname + window.location.search,
  )
  window.location.href = `/login?redirect=${redirect}`
}

export function getContext() {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({ onError: handleAuthError }),
    mutationCache: new MutationCache({ onError: handleAuthError }),
  })
  return {
    queryClient,
  }
}

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
