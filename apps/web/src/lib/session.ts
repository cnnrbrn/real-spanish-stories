import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { authClient } from './auth-client'

export const fetchSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const cookie = getRequestHeader('cookie')

    const { data } = await authClient.getSession({
      fetchOptions: cookie ? { headers: { cookie } } : undefined,
    })
    return data
  },
)
