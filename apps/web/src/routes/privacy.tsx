import { createFileRoute } from '@tanstack/react-router'
import { PageContainer, PageHeader } from '@/components/ui/page'

export const Route = createFileRoute('/privacy')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageContainer width="prose" className="text-gray-800 dark:text-gray-200">
      <PageHeader title="Privacy Policy" />
      <p className="text-sm text-muted-foreground mb-10">
        Effective Date: 01 May 2026
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
        <p>
          This Privacy Policy describes how realspanishstories.com (“we,” “our,”
          or “us”) collects, uses, and protects your information when you use
          the site.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          2. Information We Collect
        </h2>

        <p className="font-medium">a. Personal Information</p>
        <ul className="list-disc ml-6">
          <li>Email address (for account creation and subscriptions)</li>
        </ul>

        <p className="font-medium mt-3">b. Usage Data</p>
        <ul className="list-disc ml-6">
          <li>
            Anonymous analytics data collected via Umami (e.g., page views,
            referrers)
          </li>
        </ul>

        <p className="font-medium mt-3">c. Authentication Data</p>
        <p>
          We use JSON Web Tokens (JWT) stored in your browser (e.g., cookies or
          local storage) to manage user authentication and sessions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          3. How We Use Your Information
        </h2>
        <ul className="list-disc ml-6">
          <li>Provide and manage user accounts</li>
          <li>Process subscriptions and payments</li>
          <li>
            Send transactional emails (e.g., account or subscription-related)
          </li>
          <li>Analyze site usage and improve performance</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          4. Payments and Subscriptions
        </h2>
        <p>
          Payments and subscription management are handled by Polar. We do not
          store payment details. Polar may collect and process your data in
          accordance with its own privacy policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Third-Party Services</h2>
        <ul className="list-disc ml-6">
          <li>Umami (analytics)</li>
          <li>YouTube (embedded video content)</li>
          <li>Polar (payments and subscriptions)</li>
        </ul>
        <p className="mt-2">
          These services may collect data according to their own privacy
          policies.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Cookies and Storage</h2>
        <p>
          We use browser storage mechanisms (such as cookies or local storage)
          to maintain login sessions and ensure proper functionality of user
          accounts.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Data Sharing</h2>
        <p>
          We do not sell your personal data. We only share data with service
          providers necessary to operate the site (e.g., analytics, payments) or
          when required by law.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">8. Data Retention</h2>
        <p>
          We retain your data only as long as necessary to provide the service
          or comply with legal obligations.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">9. Your Rights</h2>
        <p>
          If you are located in regions with data protection laws (such as the
          European Economic Area), you may have rights including access,
          correction, deletion, and restriction of your personal data.
        </p>
        <p className="mt-2">
          To exercise your rights, please contact us via the contact form at{' '}
          <a href="/contact" className="underline">
            /contact
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">10. Security</h2>
        <p>
          We implement reasonable technical measures to protect your data, but
          no system is completely secure.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">11. Changes</h2>
        <p>
          This policy may be updated from time to time. Updates will be posted
          on this page.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">12. Contact</h2>
        <p>
          If you have any questions about this Privacy Policy or your data, you
          can contact us via our contact form at{' '}
          <a href="/contact" className="underline">
            /contact
          </a>
          .
        </p>
      </section>
    </PageContainer>
  )
}
