import { ClientOnly, Link } from '@tanstack/react-router'
import { SocialIcon } from 'react-social-icons/component'
import 'react-social-icons/youtube'
import 'react-social-icons/instagram'
import 'react-social-icons/tiktok'
import { STORY_LEVELS } from '@real-spanish-stories/shared'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {STORY_LEVELS.map((level) => (
              <Link
                key={level.value}
                to="/stories/$levelSlug"
                params={{ levelSlug: level.urlSlug }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                activeProps={{
                  className:
                    'text-sm text-foreground font-medium underline underline-offset-4',
                }}
              >
                {level.label} Spanish Stories
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
        <span className="text-sm text-muted-foreground">
          © {currentYear} Real Spanish Stories
        </span>
        <ClientOnly>
          <div className="flex gap-2">
            <SocialIcon
              url="https://www.youtube.com/@RealSpanishStories"
              target="_blank"
              style={{ height: 32, width: 32 }}
            />
            <SocialIcon
              url="https://www.tiktok.com/@realspanishstories"
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
        <div className="flex gap-4">
          <Link
            to="/terms"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            activeProps={{
              className:
                'text-sm text-foreground font-medium underline underline-offset-4',
            }}
          >
            Terms &amp; Conditions
          </Link>
          <Link
            to="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            activeProps={{
              className:
                'text-sm text-foreground font-medium underline underline-offset-4',
            }}
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
