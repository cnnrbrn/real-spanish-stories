import { Link, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const searchSchema = z.object({
  error: z.string().optional(),
})

export const Route = createFileRoute('/verify-email')({
  validateSearch: searchSchema,
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const { error } = Route.useSearch()

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="mx-auto text-3xl">Email verification</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error ? (
            <>
              <p className="text-destructive">
                Verification failed. The link may have expired.
              </p>
              <Link to="/login" className="underline">
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <p>Your email has been verified. You are now signed in.</p>
              <Link to="/" className="underline">
                Go to home
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
