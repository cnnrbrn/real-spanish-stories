import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SignupForm } from '@/features/auth/signup-form'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="mx-auto text-3xl">Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <SignupForm onSuccess={() => navigate({ to: '/check-email' })} />
        </CardContent>
      </Card>
    </div>
  )
}
