/**
 * Vercel Blob read-write token for upload API routes.
 * Vercel may expose it as BLOB_READ_WRITE_TOKEN or a store-specific name.
 */
export function getBlobReadWriteToken(): string | undefined {
  const candidates = [
    process.env.BLOB_READ_WRITE_TOKEN,
    process.env.blog_recording_READ_WRITE_TOKEN,
    // Linked store: store_Jh7vZ8gX5JDayVIQ → public base jh7vz8gx5jdayviq.public.blob.vercel-storage.com
    process.env.store_Jh7vZ8gX5JDayVIQ_READ_WRITE_TOKEN,
    process.env.STORE_JH7VZ8GX5JDAYVIQ_READ_WRITE_TOKEN,
  ]
  for (const t of candidates) {
    const v = t?.trim()
    if (v) return v
  }
  return undefined
}
