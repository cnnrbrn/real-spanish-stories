import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OAuthButtons } from '@/components/oauth-buttons'
import { PasswordInput } from '@/components/ui/password-input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const schema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

type LoginForm = z.infer<typeof schema>

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const form = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })
  const [resendSent, setResendSent] = useState(false)

  async function onSubmit(values: LoginForm) {
    setResendSent(false)
    const { error } = await authClient.signIn.email(values)
    if (error) {
      if (error.status === 403) {
        form.setError('root', {
          type: 'unverified',
          message:
            'Please verify your email before logging in. Check your inbox.',
        })
        return
      }
      form.setError('root', { message: error.message ?? 'Log in failed' })
      return
    }
    onSuccess()
  }

  async function handleResend() {
    const email = form.getValues('email')
    if (!email) return
    await authClient.sendVerificationEmail({
      email,
      callbackURL: `${window.location.origin}/verify-email`,
    })
    setResendSent(true)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <OAuthButtons />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root && (
          <div className="flex flex-col gap-2">
            <p className="text-destructive">
              {form.formState.errors.root.message}
            </p>
            {form.formState.errors.root.type === 'unverified' &&
              (resendSent ? (
                <p className="text-sm text-muted-foreground">
                  Verification email sent. Check your inbox.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-sm text-primary hover:underline self-start"
                >
                  Resend verification email
                </button>
              ))}
          </div>
        )}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Log in
        </Button>
      </form>
    </Form>
  )
}
