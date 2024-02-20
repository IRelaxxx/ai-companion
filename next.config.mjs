/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
        pathname: '/f/**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
  },

  webpack: (config) => {
    config.externals.push({
      sharp: 'commonjs sharp',
      'onnxruntime-node': 'commonjs onnxruntime-node',
    });
    return config;
  },
};

export default nextConfig;
