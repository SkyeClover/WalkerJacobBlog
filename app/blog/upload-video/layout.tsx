import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Upload blog video',
  description: 'Upload post videos and captions to Vercel Blob.',
}

export default function UploadVideoLayout({ children }: { children: React.ReactNode }) {
  return children
}
