import { Link } from '@tanstack/react-router'
import { ApiError } from '@/lib/api'

interface ErrorFallbackProps {
  error: Error
  reset: () => void
}

export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  const isServer = error instanceof ApiError && error.status >= 500
  const heading = isServer
    ? "Our server's having a moment"
    : "Something didn't load"

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center">
      <p className="text-8xl font-bold text-primary">!</p>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {heading}
      </h1>
      <p className="text-muted-foreground max-w-md">
        Something went wrong on our end. You can try reloading, or come back in
        a moment.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-card text-foreground hover:bg-muted transition-colors text-sm font-medium"
        >
          Try again
        </button>
        <Link
          to="/"
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium"
        >
          Home
        </Link>
      </div>
      <p className="text-xs text-muted-foreground/60 mt-4 max-w-md break-all">
        {error.message}
      </p>
    </div>
  )
}
