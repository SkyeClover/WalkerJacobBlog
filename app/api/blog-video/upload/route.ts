import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { getBlobReadWriteToken } from '@/lib/blob-token'

const UPLOAD_SECRET_HEADER = 'x-blog-video-secret'

/**
 * Client upload handler for blog videos and optional WebVTT captions.
 * Only allows uploads when request includes BLOG_VIDEO_UPLOAD_SECRET.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const secret = process.env.BLOG_VIDEO_UPLOAD_SECRET?.trim()
  if (!secret) {
    return NextResponse.json(
      { error: 'Blog video upload is not configured (missing BLOG_VIDEO_UPLOAD_SECRET).' },
      { status: 503 }
    )
  }

  const provided = request.headers.get(UPLOAD_SECRET_HEADER)?.trim()
  if (provided !== secret) {
    return NextResponse.json(
      {
        error:
          'Unauthorized. Enter the exact value of BLOG_VIDEO_UPLOAD_SECRET from Vercel in the Upload secret field.',
      },
      { status: 401 }
    )
  }

  const blobToken = getBlobReadWriteToken()
  if (!blobToken) {
    return NextResponse.json(
      {
        error:
          'Vercel Blob is not connected. In Vercel Dashboard go to Storage → create/link a Blob store to this project, then redeploy.',
      },
      { status: 503 }
    )
  }

  let body: HandleUploadBody
  try {
    body = (await request.json()) as HandleUploadBody
  } catch {
    return NextResponse.json({ error: 'Invalid request body (expected JSON).' }, { status: 400 })
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: blobToken,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith('blog-video/')) {
          throw new Error('Pathname must start with blog-video/')
        }

        return {
          allowedContentTypes: [
            'video/mp4',
            'video/webm',
            'video/ogg',
            'video/quicktime',
            'video/x-msvideo',
            'text/vtt',
          ],
        }
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Blog video upload completed:', blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[blog-video/upload]', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
