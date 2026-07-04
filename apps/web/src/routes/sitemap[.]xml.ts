import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { newsResponseSchema, storySchema } from '@real-spanish-stories/shared'

const HOST = 'https://realspanishstories.com'

const STATIC_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/how-it-works', priority: '0.8', changefreq: 'monthly' },
  { loc: '/stories', priority: '0.9', changefreq: 'weekly' },
  { loc: '/stories/absolute-beginner-spanish-stories', priority: '0.8', changefreq: 'weekly' },
  { loc: '/stories/beginner-spanish-stories', priority: '0.8', changefreq: 'weekly' },
  { loc: '/stories/intermediate-spanish-stories', priority: '0.8', changefreq: 'weekly' },
  { loc: '/stories/advanced-spanish-stories', priority: '0.8', changefreq: 'weekly' },
  { loc: '/easy-spanish-news', priority: '0.8', changefreq: 'weekly' },
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

        const newsResponse = await fetch(`${import.meta.env.VITE_API_URL}news`)
        const news = newsResponse.ok
          ? z.array(newsResponseSchema).parse(await newsResponse.json())
          : []

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

        const newsUrls = news
          .map(
            (item) => `
  <url>
    <loc>${HOST}/easy-spanish-news/${item.date}</loc>
    <lastmod>${item.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.6</priority>
  </url>`,
          )
          .join('')

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${storyUrls}${newsUrls}
</urlset>`

        return new Response(sitemap, {
          headers: { 'Content-Type': 'application/xml' },
        })
      },
    },
  },
})
