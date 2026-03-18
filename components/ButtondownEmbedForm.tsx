import siteMetadata from '@/data/siteMetadata'

type Props = {
  title?: string
  /** Defaults to siteMetadata.newsletter.buttondownEmbedUsername */
  username?: string
}

export default function ButtondownEmbedForm({
  title = 'Subscribe to the newsletter',
  username,
}: Props) {
  const u = username ?? siteMetadata.newsletter?.buttondownEmbedUsername
  if (!u) return null

  return (
    <div className="w-full max-w-lg">
      <div className="pb-1 text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</div>
      <form
        action={`https://buttondown.com/api/emails/embed-subscribe/${u}`}
        method="post"
        className="flex flex-col sm:flex-row"
      >
        <div>
          <label htmlFor="bd-email" className="sr-only">
            Email address
          </label>
          <input
            type="email"
            name="email"
            id="bd-email"
            autoComplete="email"
            required
            placeholder="Enter your email"
            className="focus:ring-primary-600 w-72 rounded-md border border-gray-300 bg-white px-4 py-2 focus:border-transparent focus:ring-2 focus:outline-none dark:border-gray-600 dark:bg-black"
          />
        </div>
        <div className="mt-2 flex w-full rounded-md shadow-sm sm:mt-0 sm:ml-3">
          <button
            type="submit"
            className="bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-400 focus:ring-primary-600 w-full rounded-md px-4 py-2 font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none sm:py-0 dark:ring-offset-black"
          >
            Subscribe
          </button>
        </div>
      </form>
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        <a
          href={`https://buttondown.com/refer/${u}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
        >
          Powered by Buttondown.
        </a>
      </p>
    </div>
  )
}
