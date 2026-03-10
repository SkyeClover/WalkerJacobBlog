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

  // Blob token: SDK expects BLOB_READ_WRITE_TOKEN; Vercel also injects {storeName}_READ_WRITE_TOKEN
  const blobToken = (
    process.env.BLOB_READ_WRITE_TOKEN ??
    process.env.blog_recording_READ_WRITE_TOKEN
  )?.trim()
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
    return NextResponse.json(
      { error: 'Invalid request body (expected JSON).' },
      { status: 400 }
    )
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: blobToken,
      onBeforeGenerateToken: async (pathname) => {
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
        console.log('Blog audio uploaded:', blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[blog-audio/upload]', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
