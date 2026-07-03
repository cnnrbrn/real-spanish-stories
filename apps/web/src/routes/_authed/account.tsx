import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/features/users/api'
import { PageContainer, PageHeader } from '@/components/ui/page'

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
    <PageContainer width="prose">
      <PageHeader title="Account" />
      <p className="text-muted-foreground">Signed in as {user.email}</p>
    </PageContainer>
  )
}
