import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/features/auth/login-form'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="mx-auto text-3xl">Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm onSuccess={() => navigate({ to: '/' })} />
        </CardContent>
      </Card>
    </div>
  )
}
