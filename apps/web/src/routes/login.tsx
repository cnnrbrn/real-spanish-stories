import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/features/auth/login-form'

export const Route = createFileRoute('/login')({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { redirect } = Route.useSearch()
  const safeRedirect = redirect?.startsWith('/') ? redirect : '/'

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="mx-auto text-3xl">Log in</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm onSuccess={() => navigate({ href: safeRedirect })} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link
              to="/forgot-password"
              className="hover:text-foreground hover:underline"
            >
              Forgot your password?
            </Link>
          </p>
          <p className="mt-2 text-center text-base text-muted-foreground">
            New here?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
