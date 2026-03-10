import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'

const UPLOAD_SECRET_HEADER = 'x-blog-audio-secret'

/**
 * Client upload handler for blog voice recordings.
 * Only allows uploads when request includes the correct secret (BLOG_AUDIO_UPLOAD_SECRET).
 * The browser uploads directly to Vercel Blob (no 4.5 MB limit); this route
 * only issues tokens and optionally runs onUploadCompleted.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const secret = process.env.BLOG_AUDIO_UPLOAD_SECRET?.trim()
  if (!secret) {
    return NextResponse.json(
      { error: 'Blog audio upload is not configured (missing BLOG_AUDIO_UPLOAD_SECRET).' },
      { status: 503 }
    )
  }

  const provided = request.headers.get(UPLOAD_SECRET_HEADER)?.trim()
  if (provided !== secret) {
    return NextResponse.json(
      {
        error:
          'Unauthorized. Enter the exact value of BLOG_AUDIO_UPLOAD_SECRET from Vercel in the Upload secret field.',
      },
      { status: 401 }
    )
  }

  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Restrict to blog-audio/ prefix and audio types only
        if (!pathname.startsWith('blog-audio/')) {
          throw new Error('Pathname must start with blog-audio/')
        }
        return {
          allowedContentTypes: [
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/ogg',
            'audio/webm',
            'audio/x-wav',
          ],
        }
      },
      onUploadCompleted: async ({ blob }) => {
        // Optional: log or persist the URL (e.g. to a DB). The client already gets blob.url from upload().
        console.log('Blog audio uploaded:', blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 }
    )
  }
}
