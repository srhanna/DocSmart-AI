/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Serve ads.txt from the dynamic API route so the publisher ID can be
      // stored in an environment variable rather than a hard-coded static file.
      { source: '/ads.txt', destination: '/api/ads-txt' },
    ];
  },
};

module.exports = nextConfig;
