import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/features/users/api'

export const Route = createFileRoute('/_authed/account')({
  component: AccountPage,
})

function AccountPage() {
  const { session } = Route.useRouteContext()
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    initialData: session.user,
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl mb-4">Account</h1>
      <p className="text-muted-foreground">Signed in as {user.email}</p>
    </div>
  )
}
