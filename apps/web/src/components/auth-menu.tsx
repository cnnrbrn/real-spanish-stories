import { useNavigate, useRouteContext } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import { ForgotPasswordForm } from '@/features/auth/forgot-password-form'
import { LoginForm } from '@/features/auth/login-form'
import { SignupForm } from '@/features/auth/signup-form'
import { useAuthModals } from '@/stores/auth-modals'

export default function AuthMenu() {
  const { session: ctxSession } = useRouteContext({ from: '__root__' })
  const { data: clientSession, isPending } = authClient.useSession()
  const session = isPending ? ctxSession : clientSession
  const navigate = useNavigate()

  const loginOpen = useAuthModals((s) => s.loginOpen)
  const signupOpen = useAuthModals((s) => s.signupOpen)
  const forgotOpen = useAuthModals((s) => s.forgotOpen)
  const checkEmailOpen = useAuthModals((s) => s.checkEmailOpen)
  const resetSentOpen = useAuthModals((s) => s.resetSentOpen)
  const loginHeadline = useAuthModals((s) => s.loginHeadline)
  const openLogin = useAuthModals((s) => s.openLogin)
  const openSignup = useAuthModals((s) => s.openSignup)
  const openForgot = useAuthModals((s) => s.openForgot)
  const setLoginOpen = useAuthModals((s) => s.setLoginOpen)
  const setSignupOpen = useAuthModals((s) => s.setSignupOpen)
  const setForgotOpen = useAuthModals((s) => s.setForgotOpen)
  const setCheckEmailOpen = useAuthModals((s) => s.setCheckEmailOpen)
  const setResetSentOpen = useAuthModals((s) => s.setResetSentOpen)

  async function handleSignOut() {
    await authClient.signOut()
    navigate({ to: '/' })
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleSignOut}
          className="flex-1 h-9 px-4 text-sm font-medium bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors rounded-lg"
        >
          Log out
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
      <div className="flex flex-col md:flex-row items-center gap-2">
        <button
          onClick={() => openLogin()}
          className="h-9 px-4 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors w-full md:w-auto inline-flex justify-center items-center rounded-lg"
        >
          Log in
        </button>
        <button
          onClick={openSignup}
          className="h-9 px-4 text-sm font-medium bg-transparent text-primary border border-primary hover:opacity-90 transition-colors w-full md:w-auto inline-flex justify-center items-center rounded-lg"
        >
          Sign up
        </button>
      </div>

      <DialogRoot open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent>
          {logo}
          {loginHeadline && (
            <p className="text-center text-base text-muted-foreground mb-4">
              {loginHeadline}
            </p>
          )}
          <DialogTitle className="text-center mb-6">Log in</DialogTitle>
          <LoginForm onSuccess={() => setLoginOpen(false)} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <button
              onClick={openForgot}
              className="hover:text-foreground hover:underline"
            >
              Forgot your password?
            </button>
          </p>
          <p className="mt-2 text-center text-base text-muted-foreground">
            New here?{' '}
            <button
              onClick={openSignup}
              className="text-primary hover:underline"
            >
              Sign up
            </button>
          </p>
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={signupOpen} onOpenChange={setSignupOpen}>
        <DialogContent>
          {logo}
          <DialogTitle className="text-center mb-6">Sign up</DialogTitle>
          <SignupForm
            onSuccess={() => {
              setSignupOpen(false)
              setCheckEmailOpen(true)
            }}
          />
          <p className="mt-4 text-center text-base text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={() => openLogin()}
              className="text-primary hover:underline"
            >
              Log in
            </button>
          </p>
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          {logo}
          <DialogTitle className="text-center mb-6">
            Forgot your password?
          </DialogTitle>
          <ForgotPasswordForm
            onSuccess={() => {
              setForgotOpen(false)
              setResetSentOpen(true)
            }}
          />
          <p className="mt-4 text-center text-base text-muted-foreground">
            Remembered it?{' '}
            <button
              onClick={() => openLogin()}
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
          <DialogTitle className="text-center mb-6">
            Check your inbox
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            We sent you a verification email. Click the link inside to activate
            your account.
          </p>
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={resetSentOpen} onOpenChange={setResetSentOpen}>
        <DialogContent>
          {logo}
          <DialogTitle className="text-center mb-6">
            Check your inbox
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            If your email is registered, we've sent you a link to reset your
            password.
          </p>
        </DialogContent>
      </DialogRoot>
    </>
  )
}
