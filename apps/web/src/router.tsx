import { createRouter } from '@tanstack/react-router'
import qs from 'qs'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import * as TanstackQuery from './integrations/tanstack-query/root-provider'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { NotFound } from './components/not-found'

// Create a new router instance
export const getRouter = () => {
  const rqContext = TanstackQuery.getContext()

  const router = createRouter({
    routeTree,
    context: {
      ...rqContext,
    },
    parseSearch: (searchStr) =>
      qs.parse(searchStr.startsWith('?') ? searchStr.slice(1) : searchStr, {
        comma: true,
      }),
    stringifySearch: (search) => {
      const result = qs.stringify(search, { arrayFormat: 'comma', encode: false })
      return result ? `?${result}` : ''
    },
    defaultPreload: 'intent',
    defaultNotFoundComponent: () => <NotFound />,
  })

  setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient })

  return router
}
