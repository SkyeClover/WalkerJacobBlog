import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Privacy Policy',
  description:
    'Privacy policy for walkerjacob.com and the Oura Ring Personality Matrix application. We do not collect personal data; Oura data stays on your device.',
})

export default function PrivacyPage() {
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            Privacy Policy
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Last updated: March 2026
          </p>
        </div>
        <div className="prose dark:prose-invert max-w-none pt-8 pb-12">
          <p>
            This privacy policy applies to walkerjacob.com (the blog) and personalitymatrix.walkerjacob.com
            (the Personality Matrix daily check-in app), and any related tools or features on these sites.
          </p>

          <h2 className="mt-8 text-2xl font-bold">We do not collect personal data</h2>
          <p>
            We do not collect, store, or transmit your personal data. The Personality Matrix app
            and any associated tools are designed to run without requiring you to provide personal
            information to us.
          </p>

          <h2 className="mt-8 text-2xl font-bold">Oura data stays on your device</h2>
          <p>
            Any data from your Oura Ring account (including health, sleep, or activity data) is used
            only in your browser or on your device. This data is not sent to our servers and is not
            stored by us. Processing happens locally so your Oura data never leaves your control.
          </p>

          <h2 className="mt-8 text-2xl font-bold">We do not store tokens on our servers</h2>
          <p>
            If you connect your Oura account in the Personality Matrix app, any access tokens or
            credentials are used only in your browser or on your device. We do not store Oura
            tokens, API keys, or other authentication data on our servers.
          </p>

          <h2 className="mt-8 text-2xl font-bold">Questions</h2>
          <p>
            If you have questions about this privacy policy, you can reach out via the contact
            information on this site.
          </p>
        </div>
      </div>
    </>
  )
}
