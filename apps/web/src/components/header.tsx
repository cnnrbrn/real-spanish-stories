import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/use-theme'
import AuthMenu from '@/components/auth-menu'

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <header className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <img
              src={
                mounted && theme === 'dark'
                  ? '/logo-dark.svg'
                  : '/logo-light.svg'
              }
              alt="Real Spanish Stories Logo"
              className="h-14"
            />
          </Link>
          <div className="flex items-center gap-2">
            {/* <AuthMenu /> */}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
              aria-label="Toggle theme"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
