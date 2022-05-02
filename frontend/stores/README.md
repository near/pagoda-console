# Zustand Stores

We chose [Zustand](https://github.com/pmndrs/zustand) as our global state management tool for the following reasons:

1. Low lurning curve.
2. No boilerplate.
3. Excellent TS support.
4. Very small library with 0 run time dependencies: https://bundlephobia.com/package/zustand@3.7.1

## Persisting a Store (Local/Session Storage)

Zustand comes with a default persistence middleware that unfortunately doesn't work with Next due to SSR + rehydration. Zustand tries to be helpful by hydrating stores before the app renders, which works great for traditional React SPA's, but causes [rehydration errors](https://www.joshwcomeau.com/react/the-perils-of-rehydration) for Next apps - a deal breaker. To prevent these errors, we need to hydrate our persisted stores inside a `useEffect()` hook (after the UI has rendered).

As a side note, even Jotai has a call out in their docs calling out the same problem: https://jotai.org/docs/utils/atom-with-storage#server-side-rendering

Thankfully, Zustand's API makes it extremely easy to plug in our own persistence/hydration layer for stores that need it. This gives us 2 major benefits:

1. Total control over how attributes are persisted. Some attributes in your store might not need persistence, while other attributes might need a mix of being persisted in local or session storage.

2. Ability to easily swap out global state management tools. If we decide to use a new tool, we can easily reference our existing persistence layer. Zustand's default persistence middleware would lock us in to their way of doing things - forcing us to reformat saved data and completely replace the persistence API if we changed tools.

### Creating a Persisted Store

1. Check out the `@/stores/settings` store for an example. Specifically, note the use of extending `PersistedStore` in `types.ts` and the logic inside `persist.ts`.

2. Make sure your store's interface extends from `PersistedStore`. This interface will make sure your store supports required meta attributes for hydrations (eg: `hasHydrated`).

3. Implement a `persist.ts` file using the desired `@/utils/storage` API's (hybrid, local, or session). You can use `@/stores/settings/persist.ts` as an example. The `setItem()` method for all storage API's will automatically ignore saving `hasHydrated` or any functions/actions on your store.

4. Update the `hydrateAllStores()` method in `@/utils/hydrate-all-stores.ts` to include your new store's hydration method. Our `_app.tsx` wrapper calls the `hydrateAllStores()` method to hydrate all persisted stores.

5. When using your persisted store in a hook or component, remember that you might need to differ certain logic until your store returns `hasHydrated: true`.
