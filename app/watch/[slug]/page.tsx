import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import BlogVideoPlayer from '@/components/BlogVideoPlayer'
import siteMetadata from '@/data/siteMetadata'
import { allBlogs } from 'contentlayer/generated'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

function toAbsoluteUrl(url?: string): string | undefined {
  if (!url) return undefined
  return url.startsWith('http') ? url : `${siteMetadata.siteUrl}${url}`
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  const slug = decodeURI(params.slug)
  const post = allBlogs.find((item) => item.slug === slug)
  if (!post?.videoUrl) return

  const videoUrl = toAbsoluteUrl(post.videoUrl)
  const posterUrl = toAbsoluteUrl(post.videoPoster) ?? siteMetadata.socialBanner

  return {
    title: `${post.title} (video)`,
    description: post.summary || siteMetadata.description,
    openGraph: {
      title: `${post.title} (video)`,
      description: post.summary || siteMetadata.description,
      url: `/watch/${slug}`,
      siteName: siteMetadata.title,
      locale: 'en_US',
      type: 'video.other',
      images: [{ url: posterUrl }],
      videos: videoUrl ? [{ url: videoUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} (video)`,
      description: post.summary || siteMetadata.description,
      images: [posterUrl],
    },
  }
}

export const generateStaticParams = async () =>
  allBlogs
    .filter((post) => post.videoUrl && !post.slug.includes('/'))
    .map((post) => ({ slug: decodeURI(post.slug) }))

export default async function WatchVideoPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const slug = decodeURI(params.slug)
  const post = allBlogs.find((item) => item.slug === slug)

  if (!post?.videoUrl) {
    return notFound()
  }

  return (
    <SectionContainer>
      <article className="space-y-6 pt-6 pb-10">
        <header className="space-y-2 text-center">
          <PageTitle>{post.title}</PageTitle>
          <p className="text-gray-600 dark:text-gray-400">Video view</p>
        </header>

        <BlogVideoPlayer
          src={post.videoUrl}
          title={post.title}
          poster={post.videoPoster}
          captionsSrc={post.videoCaptionsUrl}
          variant="featured"
        />

        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Link
            href={`/blog/${post.slug}`}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
          >
            Read full post
          </Link>
          <Link
            href="/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
          >
            Back to blog
          </Link>
        </div>
      </article>
    </SectionContainer>
  )
}
