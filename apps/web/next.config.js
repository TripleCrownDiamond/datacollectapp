/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@terracollect/shared', '@terracollect/form-engine'],
  output: 'standalone',
};

export default nextConfig;
