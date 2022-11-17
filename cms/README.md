# Console CMS

This CMS is used at build-time to provide content to Next.JS

## Running

Strapi has two modes based on the command used to run it:

- `develop`: allows modifying the data schema and hot reload of Strapi files like `src/index.js`
- `start`: only allows managing content i.e. CRUD on records through admin panel, publishing records

Generally, you will not need to run Strapi in `develop` mode unless you are working on the CMS itself.

For this reason, the `dev` npm script starts strapi in non-develop mode. This is what will be invoked most of the time developers are working on other packages in the monorepo. To work on the cms, run `npm run -w cms dev:cms`
