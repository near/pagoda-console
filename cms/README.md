# Console CMS

This CMS is used at build-time to provide content to Next.JS. You will need to run it manually to support building the frontend.

## Running for Builds and Content Management

When working on the Console frontend, use this command. It will build the admin panel and run Strapi in a mode meant for content
management and API consumption.

```bash
npx turbo start:cms
```

## Running to Develop CMS

This will run Strapi in a development mode where changes can be made to content type definitions and live-reload is enabled. Generally,
you will not need to run Strapi in this mode unless you are working on the CMS itself.

```bash
npm run -w cms dev:cms
```
