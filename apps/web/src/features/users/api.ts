import type { authClient } from '@/lib/auth-client'
import { apiFetch } from '@/lib/api'

type SessionData = NonNullable<
  Awaited<ReturnType<typeof authClient.getSession>>['data']
>

export type User = SessionData['user']

export async function getMe(): Promise<User> {
  const response = await apiFetch('users/me')
  return response.json()
}
