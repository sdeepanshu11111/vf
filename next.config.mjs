/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warnings are checked locally via `npm run lint`; don't block Vercel deploys
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
