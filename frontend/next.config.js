const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
module.exports = {
  experimental: { esmExternals: true },
  reactStrictMode: true,
  webpack(config, options) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    config.module.rules.push({
      test: /\.mdx?$/,
      use: [
        // The default `babel-loader` used by Next:
        options.defaultLoaders.babel,
        {
          loader: '@mdx-js/loader',
          /** @type {import('@mdx-js/loader').Options} */
          options: {
            /* jsxImportSource: …, otherOptions… */
          },
        },
      ],
    });

    return config;
  },
  i18n,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: '/analytics',
        destination: '/project-analytics',
        permanent: false,
      },
    ];
  },
};
