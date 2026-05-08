import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResendVerificationForm } from '@/features/auth/resend-verification-form'

export const Route = createFileRoute('/check-email')({
  component: CheckEmailPage,
})

function CheckEmailPage() {
  const [showResend, setShowResend] = useState(false)
  const [sent, setSent] = useState(false)

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="mx-auto text-3xl">Check your inbox</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p>
            We sent you a verification email. Click the link inside to activate
            your account.
          </p>
          {sent ? (
            <p className="text-sm text-muted-foreground">
              We've sent a new verification link.
            </p>
          ) : showResend ? (
            <ResendVerificationForm onSuccess={() => setSent(true)} />
          ) : (
            <button
              onClick={() => setShowResend(true)}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline self-start"
            >
              Didn't get the email?
            </button>
          )}
          <Link to="/login" className="underline">
            Back to log in
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
