import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const schema = z.object({ password: z.string().min(8) })
type ResetPasswordForm = z.infer<typeof schema>

interface ResetPasswordFormProps {
  token: string
  onSuccess: () => void
}

export function ResetPasswordForm({
  token,
  onSuccess,
}: ResetPasswordFormProps) {
  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { password: '' },
  })

  async function onSubmit(values: ResetPasswordForm) {
    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    })
    if (error) {
      form.setError('root', {
        message: error.message ?? 'Could not reset password',
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <PasswordInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Reset password
        </Button>
      </form>
    </Form>
  )
}
