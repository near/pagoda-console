# **Pagoda Developer Console Frontend**

View at [http://console.near.dev]

# Stack

Language: Typescript

Framework: [Next.js](https://nextjs.org/)

UI: [Radix](https://www.radix-ui.com/) & [Stitches](https://stitches.dev/)

Identity Management: [Firebase Auth](https://firebase.google.com/docs/auth)

### Ngrok

Now that you have the server running, you'll most likely want to set up `localhost:3000` with an `ngrok` proxy domain as detailed [here](https://nearinc.atlassian.net/wiki/spaces/DEVCONSOLE/pages/36438083/Onboarding).

# Contributing

## Modules

DevConsole consists of multiple modules owned by different teams within Pagoda. Each module has isolated directories within this repository for their work, and should refrain from touching files outside those directories.

The folders are:

- `/modules/{module}/`: This directory is instantiated with a few subdirectories for suggested organization, but it is entirely owned by the module team to use as they see fit. It should contain all non-page files necessary to build the module
- `/pages/{module}/`: Contains all pages to be rendered for this module as `.tsx` files. See the [Next.js Pages](https://nextjs.org/docs/basic-features/pages) doc for more information

#### Example

Given a module named `alerts` with the following files

```
/modules
  /alerts
    /utils
    /components
      AlertDetailCard.tsx
    /hooks
/pages
  /alerts
    index.tsx
    new-alert.tsx
```

Two pages will be available in the UI: `/alerts` and `/alerts/new-alert`. The page files `/pages/alerts/index.tsx` and `/pages/alerts/new-alert.tsx` will likely have the following import:

```
import { AlertDetailCard } from '@/modules/alerts/components/AlertDetailCard'
```

## Styles & Components

This project uses [Radix](https://www.radix-ui.com/) and [Stitches](https://stitches.dev/). We have built out a library of generic, reusable components in [components/lib](./components/lib). You can view all of these components by visiting `/ui` when running the server locally or on the [development server](https://core.dev.console.pagoda.co/ui). The `/ui` route is hidden in production.

View the [UI Library README](./components/lib/README.md) to learn more about our UI library, components, styling, and conventions.

## Page Layouts

Pages take advantage of the Next.js [layouts](https://nextjs.org/docs/basic-features/layouts) feature. Currently there are three layouts: `DashboardLayout`, `SimpleLayout`, and `SimpleLogoutLayout`. Choose a layout by setting the `getLayout` property to the appropriate hook from the [hooks/layouts.tsx](hooks/layouts.tsx) file.

```tsx
import type { NextPageWithLayout } from '@/utils/types';
import { useDashboardLayout } from '@/hooks/layouts';

const NewPage: NextPageWithLayout = () => {
  // page content
};

NewPage.getLayout = useDashboardLayout;

export default NewPage;
```

### Page Layout: Dashboard With Options

When using our `DashboardLayout`, sometimes we need to define properties that handle more advanced requirements. A common use case for this is on pages that should be redirected away from when the user changes their selected project and/or environment:

```ts
import { wrapDashboardLayoutWithOptions } from '@/hooks/layouts';

NewPage.getLayout = wrapDashboardLayoutWithOptions({
  redirect: {
    environmentChange: true,
    projectChange: true,
    url: '/alerts',
  },
});

export default NewPage;
```

## Data Fetching

[SWR](https://swr.vercel.app/) is used heavily for data fetching. This library makes it easy to build a UI that melds quick loading from cached data with frequent revalidation fetches to make sure the UI stays up to date. It is highly recommended to read the SWR docs in their entirety and familiarize yourself with how it works and what options are available. Data fetchers are defined in [utils/fetchers.ts](utils/fetchers.ts)

## Path Alias

Next JS supports `tsconfig.json` path aliases out of the box. We've set up a root `@/` alias that will allow us to write `@/utils/abc.tsx` instead of `../../../utils/abc.tsx`. This alias should be preferred most of the time when referencing root folders like `utils`, `public`, or `components`.

## Date Formatting

For date formatting, we use [Luxon](https://moment.github.io/luxon).

## JWT Reveal

When running locally or in development (`NEXT_PUBLIC_DEPLOY_ENV` is `LOCAL` or `DEVELOPMENT`), you can easily grab the JWT for the current session by clicking on the Pagoda icon in the sidebar. This is useful for manual API testing through Postman.

## Comments

Where helpful, utilize [Better Comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments) syntax to add context to your comments

## Environment Variables

To make the environment variable available in the browser at runtime, it must be prefixed with `NEXT_PUBLIC_`: [Next.js Environment Variables docs](https://nextjs.org/docs/basic-features/environment-variables)

For our deployment servers, environment variables are currently managed by Vercel: https://vercel.com/docs/concepts/projects/environment-variables

All environment variables are read into a config object in [utils/config.ts](utils/config.ts). This allows casting the values to their desired types in a central location and early process termination if any values were not defined.
