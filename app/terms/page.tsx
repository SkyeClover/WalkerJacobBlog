import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Terms of Service',
  description:
    'Terms of service for walkerjacob.com and the Oura Ring Personality Matrix application.',
})

export default function TermsPage() {
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            Terms of Service
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Last updated: March 2026
          </p>
        </div>
        <div className="prose dark:prose-invert max-w-none pt-8 pb-12">
          <p>
            These terms apply to your use of walkerjacob.com (the blog) and
            personalitymatrix.walkerjacob.com (the Personality Matrix daily check-in app), and any
            related tools or features on these sites.
          </p>

          <h2 className="mt-8 text-2xl font-bold">Use of the sites</h2>
          <p>
            You may use these sites and their tools for personal, non-commercial purposes. Do not
            use them in any way that violates applicable laws or the rights of others.
          </p>

          <h2 className="mt-8 text-2xl font-bold">Oura integration</h2>
          <p>
            If you connect your Oura account, you do so under Oura’s own terms and API policies.
            Data from Oura is used only in your browser or on your device and is not stored on our
            servers. We are not responsible for Oura’s services or how they handle your data.
          </p>

          <h2 className="mt-8 text-2xl font-bold">No warranty</h2>
          <p>
            These sites and the Personality Matrix app are provided “as is.” We do not guarantee
            accuracy, availability, or fitness for any particular purpose. Health-related
            information is not medical advice.
          </p>

          <h2 className="mt-8 text-2xl font-bold">Limitation of liability</h2>
          <p>
            To the extent permitted by law, we are not liable for any indirect, incidental, or
            consequential damages arising from your use of these sites or their tools.
          </p>

          <h2 className="mt-8 text-2xl font-bold">Changes</h2>
          <p>
            We may update these terms from time to time. The “Last updated” date at the top reflects
            the most recent change. Continued use of these sites after changes constitutes
            acceptance of the updated terms.
          </p>

          <h2 className="mt-8 text-2xl font-bold">Contact</h2>
          <p>
            For questions about these terms, you can reach out via the contact information on this
            site.
          </p>
        </div>
      </div>
    </>
  )
}
