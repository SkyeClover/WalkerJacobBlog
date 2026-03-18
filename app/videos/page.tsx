import Link from '@/components/Link'
import SectionContainer from '@/components/SectionContainer'
import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import { sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import type { Blog } from 'contentlayer/generated'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Videos',
  description: 'Browse all posts with video on the blog.',
})

function posterForPost(post: Blog): string {
  if (post.videoPoster) return post.videoPoster
  if (post.images) {
    const img = typeof post.images === 'string' ? post.images : post.images[0]
    if (img && !img.startsWith('http')) {
      return `${siteMetadata.siteUrl}${img.startsWith('/') ? '' : '/'}${img}`
    }
    return img
  }
  const banner = siteMetadata.socialBanner
  return banner.startsWith('http')
    ? banner
    : `${siteMetadata.siteUrl}${banner.startsWith('/') ? '' : '/'}${banner}`
}

export default function VideosPage() {
  const isProduction = process.env.NODE_ENV === 'production'
  const posts = sortPosts(allBlogs).filter(
    (p) => Boolean(p.videoUrl) && (!isProduction || p.draft !== true)
  )

  const quickNav = headerNavLinks.filter((l) => l.href !== '/videos')

  return (
    <SectionContainer>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-4 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            Videos
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Posts that include a video. Open the watch page for a focused player or read the full
            article.
          </p>
          <nav
            className="flex flex-wrap gap-x-4 gap-y-2 border-t border-gray-200 pt-4 dark:border-gray-700"
            aria-label="Site sections"
          >
            {quickNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-primary-500 dark:hover:text-primary-400 text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="py-12">
          {posts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No videos yet. Add <code className="text-sm">videoUrl</code> to a post&apos;s
              frontmatter, or{' '}
              <Link
                href="/blog/upload-video"
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              >
                upload a video
              </Link>
              .
            </p>
          ) : (
            <ul className="-m-4 flex flex-wrap">
              {posts.map((post) => {
                const thumb = posterForPost(post)

                return (
                  <li key={post.slug} className="w-full p-4 md:w-1/2">
                    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                      <Link
                        href={`/watch/${post.slug}`}
                        className="relative block aspect-video bg-gray-900"
                        aria-label={`Watch: ${post.title}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- remote Blob/posters */}
                        <img
                          src={thumb}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                        />
                        <span className="bg-primary-500/90 absolute right-3 bottom-3 rounded-md px-2 py-1 text-xs font-semibold text-white">
                          Watch
                        </span>
                      </Link>
                      <div className="flex flex-1 flex-col p-5">
                        <h2 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                          <Link
                            href={`/watch/${post.slug}`}
                            className="hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            {post.title}
                          </Link>
                        </h2>
                        {post.summary && (
                          <p className="mb-4 line-clamp-3 flex-1 text-sm text-gray-600 dark:text-gray-400">
                            {post.summary}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 text-sm font-medium">
                          <Link
                            href={`/watch/${post.slug}`}
                            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            Open watch view →
                          </Link>
                          <Link
                            href={`/blog/${post.slug}`}
                            className="hover:text-primary-500 dark:hover:text-primary-400 text-gray-600 dark:text-gray-400"
                          >
                            Read post →
                          </Link>
                        </div>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </SectionContainer>
  )
}
