'use client'

import type { PutBlobResult } from '@vercel/blob'
import { upload } from '@vercel/blob/client'
import { useRef, useState } from 'react'
import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'

const UPLOAD_SECRET_HEADER = 'x-blog-video-secret'
const SECRET_STORAGE_KEY = 'blog-video-upload-secret'

type UploadedAssetType = 'videoUrl' | 'videoCaptionsUrl'

function inferUploadType(file: File): UploadedAssetType | null {
  const fileName = file.name.toLowerCase()
  if (file.type === 'text/vtt' || fileName.endsWith('.vtt')) return 'videoCaptionsUrl'
  if (file.type.startsWith('video/')) return 'videoUrl'
  return null
}

export default function BlogVideoUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null)
  const [blob, setBlob] = useState<PutBlobResult | null>(null)
  const [assetType, setAssetType] = useState<UploadedAssetType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [secret, setSecret] = useState(() => {
    if (typeof window === 'undefined') return ''
    return window.sessionStorage.getItem(SECRET_STORAGE_KEY) ?? ''
  })

  const copyUrl = () => {
    if (!blob?.url) return
    void navigator.clipboard.writeText(blob.url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <SectionContainer>
      <div className="space-y-6">
        <div>
          <PageTitle>Upload blog video</PageTitle>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
            Upload a video (<code>.mp4</code>, <code>.webm</code>, etc.) or captions file (
            <code>.vtt</code>) for a post. The file is uploaded directly to Vercel Blob.
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Protect uploads with <code>BLOG_VIDEO_UPLOAD_SECRET</code> in Vercel.
          </p>
        </div>

        <form
          className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50"
          onSubmit={async (event) => {
            event.preventDefault()
            setError(null)
            setBlob(null)
            setAssetType(null)

            if (!secret.trim()) {
              setError('Please enter the upload secret.')
              return
            }

            const file = inputFileRef.current?.files?.[0]
            if (!file) {
              setError('Please select a video or WebVTT captions file.')
              return
            }

            const inferredType = inferUploadType(file)
            if (!inferredType) {
              setError('Unsupported file type. Upload a video file or .vtt captions.')
              return
            }

            if (typeof window !== 'undefined') {
              window.sessionStorage.setItem(SECRET_STORAGE_KEY, secret.trim())
            }

            const pathPrefix =
              inferredType === 'videoCaptionsUrl' ? 'blog-video/captions' : 'blog-video'
            const pathname = `${pathPrefix}/${file.name}`

            setUploading(true)
            setProgress(0)
            try {
              const newBlob = await upload(pathname, file, {
                access: 'public',
                handleUploadUrl: '/api/blog-video/upload',
                multipart: true,
                onUploadProgress: (uploadProgress) => setProgress(uploadProgress.percentage ?? 0),
                headers: { [UPLOAD_SECRET_HEADER]: secret.trim() },
              })

              setBlob(newBlob)
              setAssetType(inferredType)
            } catch (uploadError) {
              setError(uploadError instanceof Error ? uploadError.message : String(uploadError))
            } finally {
              setUploading(false)
              setProgress(null)
            }
          }}
        >
          <div className="mb-4">
            <label
              htmlFor="upload-secret"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Upload secret
            </label>
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Must match <code>BLOG_VIDEO_UPLOAD_SECRET</code> in Vercel (Production). If uploads
              fail with 400, ensure a Blob store is connected (Vercel → Storage), then redeploy.
            </p>
            <input
              id="upload-secret"
              type="password"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              placeholder="Same value as BLOG_VIDEO_UPLOAD_SECRET"
              autoComplete="off"
              disabled={uploading}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <input
              ref={inputFileRef}
              name="file"
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*,.vtt,text/vtt"
              required
              disabled={uploading}
              className="file:bg-primary-500 file:hover:bg-primary-600 block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white dark:text-gray-400"
            />
            <button
              type="submit"
              disabled={uploading}
              className="bg-primary-500 hover:bg-primary-600 rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>

          {uploading && progress != null && (
            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="bg-primary-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {Math.round(progress)}%
              </p>
            </div>
          )}
        </form>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {blob && assetType && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Use this URL in your post frontmatter:
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <code className="flex-1 rounded bg-gray-200 px-2 py-1 text-sm break-all dark:bg-gray-700">
                {blob.url}
              </code>
              <button
                type="button"
                onClick={copyUrl}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              In your .mdx frontmatter add:{' '}
              <code>
                {assetType === 'videoUrl'
                  ? `videoUrl: '${blob.url}'`
                  : `videoCaptionsUrl: '${blob.url}'`}
              </code>
            </p>
            {assetType === 'videoUrl' && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Optional: add <code>videoPoster</code> for a custom thumbnail image.
              </p>
            )}
          </div>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          >
            ← Back to blog
          </Link>
        </p>
      </div>
    </SectionContainer>
  )
}
