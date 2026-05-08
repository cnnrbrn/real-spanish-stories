import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResetPasswordForm } from '@/features/auth/reset-password-form'

export const Route = createFileRoute('/reset-password')({
  validateSearch: z.object({
    token: z.string().optional(),
    error: z.string().optional(),
  }),
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { token, error } = Route.useSearch()
  const [success, setSuccess] = useState(false)

  const title = success
    ? 'Password reset'
    : error || !token
      ? 'Link invalid or expired'
      : 'Reset your password'

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="mx-auto text-3xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col gap-4">
              <p className="text-center text-muted-foreground">
                Your password has been updated.
              </p>
              <Button asChild>
                <Link to="/login">Log in</Link>
              </Button>
            </div>
          ) : error || !token ? (
            <div className="flex flex-col gap-4">
              <p className="text-center text-muted-foreground">
                This reset link is no longer valid. Request a new one.
              </p>
              <Button asChild variant="outline">
                <Link to="/forgot-password">Request a new link</Link>
              </Button>
            </div>
          ) : (
            <ResetPasswordForm
              token={token}
              onSuccess={() => setSuccess(true)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
