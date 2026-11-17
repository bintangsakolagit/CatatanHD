import type { NextConfig } from 'next'

/**
 * Konfigurasi Next.js.
 * `transpilePackages` membuat paket @catatanhd/be (berisi TypeScript) ikut dikompilasi
 * oleh Next, sehingga tidak perlu langkah build terpisah untuk lapisan backend.
 */
const nextConfig: NextConfig = {
  transpilePackages: ['@catatanhd/be'],
  poweredByHeader: false,
  reactStrictMode: true,
}

export default nextConfig
