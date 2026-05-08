import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const schema = z.object({ email: z.email() })
type ResendVerificationForm = z.infer<typeof schema>

interface ResendVerificationFormProps {
  onSuccess: () => void
}

export function ResendVerificationForm({
  onSuccess,
}: ResendVerificationFormProps) {
  const form = useForm<ResendVerificationForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values: ResendVerificationForm) {
    const { error } = await authClient.sendVerificationEmail({
      email: values.email,
      callbackURL: `${window.location.origin}/verify-email`,
    })
    if (error) {
      form.setError('root', {
        message: error.message ?? 'Could not send verification email',
      })
      return
    }
    onSuccess()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        {form.formState.errors.root && (
          <p className="text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}
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
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Send a new verification link
        </Button>
      </form>
    </Form>
  )
}
