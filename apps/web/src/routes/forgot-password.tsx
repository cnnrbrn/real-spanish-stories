import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ForgotPasswordForm } from '@/features/auth/forgot-password-form'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="mx-auto text-3xl">
            {sent ? 'Check your inbox' : 'Forgot your password?'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <p className="text-center text-muted-foreground">
              If your email is registered, we've sent you a link to reset your
              password.
            </p>
          ) : (
            <ForgotPasswordForm onSuccess={() => setSent(true)} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
