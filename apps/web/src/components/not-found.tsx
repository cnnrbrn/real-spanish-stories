import { Link } from '@tanstack/react-router'

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center">
      <p className="text-8xl font-bold text-primary">404</p>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Page not found</h1>
      <p className="text-muted-foreground">
        {children || 'The page you are looking for does not exist.'}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-card text-foreground hover:bg-muted transition-colors text-sm font-medium"
        >
          Go back
        </button>
        <Link
          to="/"
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium"
        >
          Home
        </Link>
      </div>
    </div>
  )
}
