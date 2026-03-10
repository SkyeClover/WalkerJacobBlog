'use client'

interface BlogAudioPlayerProps {
  src: string
  title?: string
}

export default function BlogAudioPlayer({ src, title }: BlogAudioPlayerProps) {
  return (
    <div
      className="not-prose mb-8 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
      role="region"
      aria-label="Listen to this post"
    >
      <p className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
        Listen to this post
      </p>
      <audio
        controls
        preload="metadata"
        className="w-full"
        aria-label={title ? `Audio reading: ${title}` : 'Post audio'}
      >
        <source src={src} />
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}
