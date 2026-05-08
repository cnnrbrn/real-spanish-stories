import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResendVerificationForm } from '@/features/auth/resend-verification-form'

const searchSchema = z.object({
  error: z.string().optional(),
})

export const Route = createFileRoute('/verify-email')({
  validateSearch: searchSchema,
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const { error } = Route.useSearch()
  const [sent, setSent] = useState(false)

  const title = sent
    ? 'Check your inbox'
    : error
      ? 'Link expired'
      : 'Email verification'

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="mx-auto text-3xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {sent ? (
            <p className="text-center text-muted-foreground">
              If your email is registered, we've sent you a new verification
              link.
            </p>
          ) : error ? (
            <>
              <p>This verification link has expired or is invalid.</p>
              <ResendVerificationForm onSuccess={() => setSent(true)} />
            </>
          ) : (
            <>
              <p>Your email has been verified. You are now logged in.</p>
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
