import { ClientOnly } from '@tanstack/react-router'
import { SocialIcon } from 'react-social-icons/component'
import 'react-social-icons/youtube'
import 'react-social-icons/instagram'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center gap-4">
        <ClientOnly>
          <div className="flex gap-2">
            <SocialIcon
              url="https://www.youtube.com/@RealSpanishStories"
              target="_blank"
              style={{ height: 32, width: 32 }}
            />
            <SocialIcon
              url="https://www.instagram.com/realspanishstories/"
              target="_blank"
              style={{ height: 32, width: 32 }}
            />
          </div>
        </ClientOnly>
        <p className="text-sm text-muted-foreground">
          © {currentYear} Real Spanish Stories
        </p>
        <a
          href="mailto:info@realspanishstories.com"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          info@realspanishstories.com
        </a>
      </div>
    </footer>
  )
}
