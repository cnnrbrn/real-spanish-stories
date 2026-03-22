import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import { LoginForm } from '@/features/auth/login-form'
import { SignupForm } from '@/features/auth/signup-form'

export default function AuthMenu() {
  const { data: session, isPending } = authClient.useSession()
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)
  const [checkEmailOpen, setCheckEmailOpen] = useState(false)

  function openLogin() {
    setSignupOpen(false)
    setLoginOpen(true)
  }

  function openSignup() {
    setLoginOpen(false)
    setSignupOpen(true)
  }

  if (isPending) {
    return (
      <div className="h-8 w-8 bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
    )
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => authClient.signOut()}
          className="flex-1 h-9 px-4 text-sm font-medium bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors rounded-lg"
        >
          Sign out
        </button>
      </div>
    )
  }

  const logo = (
    <div className="flex justify-center mb-8">
      <img
        src="/logo-light.svg"
        alt="Logo"
        className="h-20 object-contain dark:hidden"
      />
      <img
        src="/logo-dark.svg"
        alt="Logo"
        className="h-20 object-contain hidden dark:block"
      />
    </div>
  )

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={openLogin}
          className="h-9 px-4 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors inline-flex items-center rounded-lg"
        >
          Log in
        </button>
        <button
          onClick={openSignup}
          className="h-9 px-4 text-sm font-medium bg-transparent text-primary border border-primary hover:opacity-90 transition-colors inline-flex items-center rounded-lg"
        >
          Sign up
        </button>
      </div>

      <DialogRoot open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent>
          {logo}
          <DialogTitle className="text-center mb-6">Log in</DialogTitle>
          <LoginForm onSuccess={() => setLoginOpen(false)} />
          <p className="mt-4 text-center text-base text-muted-foreground">
            New here?{' '}
            <button
              onClick={openSignup}
              className="text-primary hover:underline"
            >
              Create an account
            </button>
          </p>
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={signupOpen} onOpenChange={setSignupOpen}>
        <DialogContent>
          {logo}
          <DialogTitle className="text-center mb-6">Create account</DialogTitle>
          <SignupForm onSuccess={() => { setSignupOpen(false); setCheckEmailOpen(true) }} />
          <p className="mt-4 text-center text-base text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={openLogin}
              className="text-primary hover:underline"
            >
              Log in
            </button>
          </p>
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={checkEmailOpen} onOpenChange={setCheckEmailOpen}>
        <DialogContent>
          {logo}
          <DialogTitle className="text-center mb-6">Check your inbox</DialogTitle>
          <p className="text-center text-muted-foreground">
            We sent you a verification email. Click the link inside to activate your account.
          </p>
        </DialogContent>
      </DialogRoot>
    </>
  )
}
