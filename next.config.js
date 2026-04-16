/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-2abf1fca1a994517beb3fb17c83b3094.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'cdn.dummyjson.com',
      },
    ],
  },
  // Note: ESLint configuration moved to package.json scripts in Next.js 16+
  // To disable ESLint during builds, use: "build": "next build --no-lint"
};

module.exports = nextConfig;
