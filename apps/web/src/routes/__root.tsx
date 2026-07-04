import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Toaster } from 'sonner'
import videojsCss from 'video.js/dist/video-js.css?url'
import Header from '../components/header'
import Footer from '../components/footer'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import appCss from '../styles.css?url'
import type { QueryClient } from '@tanstack/react-query'
import { fetchSession } from '@/lib/session'

// Runs synchronously in <head> before first paint to avoid a flash of light
// theme. Coupled to the persist key 'preferences' and JSON shape used by
// apps/web/src/stores/preferences.ts — keep both in sync.
const THEME_INIT_SCRIPT = `
(function() {
  try {
    var raw = localStorage.getItem('preferences');
    var prefs = {};
    if (raw) {
      try { prefs = JSON.parse(raw); } catch (e) {}
    }
    if (!prefs.state) prefs.state = {};
    if (!prefs.state.theme) {
      var old = localStorage.getItem('theme');
      if (old === 'dark' || old === 'light') {
        prefs.state.theme = old;
        if (typeof prefs.version !== 'number') prefs.version = 0;
        localStorage.setItem('preferences', JSON.stringify(prefs));
        localStorage.removeItem('theme');
      }
    }
    var theme = prefs.state.theme || 'system';
    var resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    if (resolved === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => ({ session: await fetchSession() }),
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'description',
        content:
          'Learn Spanish by listening to short audio stories from real Latin American history, across four levels. Narrated in clear Argentine Spanish with full transcripts and English translations.',
      },
      {
        title: 'Spanish Listening Practice with Real Latin American Stories',
      },
      { name: 'twitter:card', content: 'summary_large_image' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Real Spanish Stories' },
      {
        property: 'og:title',
        content: 'Spanish Listening Practice with Real Latin American Stories',
      },
      {
        property: 'og:description',
        content:
          'Learn Spanish by listening to short audio stories from real Latin American history, across four levels. Narrated in clear Argentine Spanish with full transcripts and English translations.',
      },
      {
        property: 'og:image',
        content: 'https://realspanishstories.com/og-image.jpg',
      },
    ],
    scripts: [
      {
        src: 'https://cloud.umami.is/script.js',
        defer: true,
        'data-website-id': import.meta.env.VITE_UMAMI_WEBSITE_ID,
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'stylesheet',
        href: videojsCss,
      },
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon.png',
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster richColors position="top-center" />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
