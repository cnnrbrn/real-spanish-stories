import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/terms')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-1">Terms and Conditions</h1>
      <p className="text-sm text-gray-500 mb-10">Effective Date: 01 May 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
        <p>
          By accessing or using realspanishstories.com ("we," "our," or "us"),
          you agree to be bound by these Terms and Conditions. If you do not
          agree, do not use the site.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Use of the Service</h2>
        <p>
          The website provides access to Spanish learning content, including
          videos and translations. You agree to use the service only for lawful
          purposes and in accordance with these terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
        <ul className="list-disc ml-6">
          <li>
            You may be required to create an account to access certain features.
          </li>
          <li>
            You are responsible for maintaining the confidentiality of your
            account.
          </li>
          <li>You agree to provide accurate and complete information.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          4. Subscriptions and Payments
        </h2>
        <p>
          Some features require a paid subscription. Payments and subscription
          management are handled by Polar. By subscribing, you agree to any
          applicable pricing, billing cycles, and terms provided at checkout.
        </p>
        <ul className="list-disc ml-6 mt-2">
          <li>Subscriptions may renew automatically unless canceled.</li>
          <li>
            You can cancel your subscription at any time through your account or
            payment provider.
          </li>
          <li>
            Refunds are not guaranteed and may be handled according to applicable
            laws or provider policies.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          5. Content and Intellectual Property
        </h2>
        <p>
          All content on this site, including text, videos, translations, and
          design, is owned by or licensed to us and is protected by intellectual
          property laws.
        </p>
        <ul className="list-disc ml-6 mt-2">
          <li>
            You may not copy, distribute, or reproduce content without
            permission.
          </li>
          <li>Content is provided for personal, non-commercial use only.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Third-Party Content</h2>
        <p>
          The site may include embedded content from third parties such as
          YouTube. We are not responsible for the content, policies, or practices
          of third-party services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Prohibited Conduct</h2>
        <ul className="list-disc ml-6">
          <li>Using the service for illegal purposes</li>
          <li>Attempting to gain unauthorized access to accounts or systems</li>
          <li>Interfering with the operation or security of the site</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your access at any time
          for violations of these terms or misuse of the service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">9. Disclaimer</h2>
        <p>
          The service is provided "as is" without warranties of any kind. We do
          not guarantee uninterrupted or error-free operation.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          10. Limitation of Liability
        </h2>
        <p>
          To the fullest extent permitted by law, we are not liable for any
          indirect, incidental, or consequential damages arising from your use of
          the service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">11. Changes to Terms</h2>
        <p>
          We may update these Terms at any time. Continued use of the site
          constitutes acceptance of the updated Terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">12. Contact</h2>
        <p>
          For questions about these Terms, contact us via{' '}
          <a href="/contact" className="underline">
            /contact
          </a>
          .
        </p>
      </section>
    </div>
  )
}
