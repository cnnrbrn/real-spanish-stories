import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { storySchema } from '@real-spanish-stories/shared'

const HOST = 'https://realspanishstories.com'

const STATIC_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/how-it-works', priority: '0.8', changefreq: 'monthly' },
  { loc: '/stories/just-starting-spanish-stories', priority: '0.8', changefreq: 'weekly' },
  { loc: '/stories/beginner-spanish-stories', priority: '0.8', changefreq: 'weekly' },
  { loc: '/stories/intermediate-spanish-stories', priority: '0.8', changefreq: 'weekly' },
  { loc: '/stories/advanced-spanish-stories', priority: '0.8', changefreq: 'weekly' },
]

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}stories`)
        if (!response.ok) {
          return new Response('Failed to fetch stories', { status: 500 })
        }
        const stories = z.array(storySchema).parse(await response.json())

        const staticUrls = STATIC_PAGES.map(
          (page) => `
  <url>
    <loc>${HOST}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
        ).join('')

        const storyUrls = stories
          .map(
            (story) => `
  <url>
    <loc>${HOST}/story/${story.slug}</loc>
    <lastmod>${story.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
          )
          .join('')

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${storyUrls}
</urlset>`

        return new Response(sitemap, {
          headers: { 'Content-Type': 'application/xml' },
        })
      },
    },
  },
})
