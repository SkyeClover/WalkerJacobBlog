import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Upload blog audio',
  description: 'Upload voice recordings for blog posts to Vercel Blob.',
}

export default function UploadAudioLayout({ children }: { children: React.ReactNode }) {
  return children
}
