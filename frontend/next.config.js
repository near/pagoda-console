/* eslint-disable @typescript-eslint/no-var-requires */
const { i18n } = require('./next-i18next.config');
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const moduleExports = {
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none'",
          },
        ],
      },
    ];
  },
  sentry: {
    hideSourceMaps: false, // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#use-hidden-source-map
  },
  experimental: { esmExternals: true, externalDir: true },
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
  /*
    NOTE: "swcMinify: true" was throwing an error when running "npm run build" due to the "@near-wallet-selector" package
    used in useWalletSelector() "hooks/wallet-selector.ts"

    The production code is still minified - just a little bit slower during the build step using Terse. We can revist
    after NEAR Con.
  */
  async redirects() {
    return [
      {
        source: '/analytics',
        destination: '/project-analytics',
        permanent: false,
      },
    ];
  },
  rewrites: async () => [
    {
      source: '/api/segment',
      destination: 'https://api.segment.io/v1/batch',
    },
  ],
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
  ignoreFile: '/.gitignore',
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
