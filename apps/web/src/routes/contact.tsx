import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema } from '@real-spanish-stories/shared'
import type { ContactRequest } from '@real-spanish-stories/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  PageContainer,
  pageDescriptionClass,
  pageTitleClass,
} from '@/components/ui/page'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})

function ContactPage() {
  const form = useForm<ContactRequest>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', message: '', website: '' },
  })

  const { isSubmitting, isSubmitSuccessful, errors } = form.formState

  async function onSubmit(values: ContactRequest) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (!response.ok) {
      form.setError('root', {
        message: 'Something went wrong. Please try again.',
      })
      return
    }

    form.reset()
  }

  return (
    <PageContainer width="prose">
      <h1 className={pageTitleClass}>Contact us</h1>
      <p className={pageDescriptionClass}>
        Have a question, feedback or story suggestion?
      </p>
      <p className={pageDescriptionClass}>We'd love to hear from you.</p>

      {isSubmitSuccessful && (
        <p className="text-green-600 dark:text-green-400 font-medium mb-6">
          Thanks for getting in touch — we'll get back to you soon.
        </p>
      )}

      {errors.root && (
        <p className="text-destructive text-sm mb-6">{errors.root.message}</p>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <fieldset disabled={isSubmitting} className="flex flex-col gap-5 border-none p-0 m-0">
            <input type="text" {...form.register('website')} aria-hidden="true" tabIndex={-1} className="hidden" />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} maxLength={100} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Message <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Your message..." className="min-h-36" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </fieldset>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send message'}
          </Button>
        </form>
      </Form>
    </PageContainer>
  )
}
