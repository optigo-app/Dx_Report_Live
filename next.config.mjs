/** @type {import('next').NextConfig} */

const nextConfig = {
  basePath: "/live",
  assetPrefix: "/live",
  trailingSlash: false,
  skipTrailingSlashRedirect: true,

  sassOptions: {
    additionalData: `@use "@/Sass/Variable.scss" as *;`,
  },

  webpack: (config, { isServer }) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;