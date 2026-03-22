import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/check-email')({
  component: CheckEmailPage,
})

function CheckEmailPage() {
  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="mx-auto text-3xl">Check your inbox</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p>We sent you a verification email. Click the link inside to activate your account.</p>
          <Link to="/login" className="underline">
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
