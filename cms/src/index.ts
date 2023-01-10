import { Strapi } from "@strapi/strapi";
import { Entity } from "@strapi/strapi/lib/core-api/service";

const defaultTemplate = {};

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Strapi }) {
    //check if some data has been bootstrapped already
    const entries = await strapi.entityService.findMany(
      "api::template.template",
      {}
    );

    if (!entries.length) {
      // bootstrap
      // await strapi.entityService.create("api::template.template", {
      //   data: {
      //     name: "An Example Template",
      //     contractLanguage: "Rust",
      //     githubUrl: "https://github.com/mpeterdev/example-template",
      //     createdAt: "2022-11-16T18:59:02.595Z",
      //     updatedAt: "2022-11-16T20:05:30.901Z",
      //     publishedAt: "2022-11-16T20:05:30.896Z",
      //     heroUrl:
      //       "https://global-uploads.webflow.com/62aa48199599134b58df0800/62aa48199599130e54df0916_pagoda_castle-p-800.png",
      //     architectureUrl: "https://dummyimage.com/600x400/d4177c/ffffff.png",
      //     features:
      //       "Create your own native loyalty program using a NEAR Fungible Token\nEnd-users can earn tokens at time of purchase without needing a NEAR wallet\nEnd-users can redeem their tokens for goods instead of purchasing with their fiat currency\nInteract with the loyalty system using a web & mobile web UI",
      //     featuresRich:
      //       "- Create your own native loyalty program using a NEAR Fungible Token\n- End-users can earn tokens at time of purchase without needing a NEAR wallet\n- End-users can redeem their tokens for goods instead of purchasing with their fiat currency\n- Interact with the loyalty system using a web & mobile web UI",
      //     benefits:
      //       "FTs act similarly to loyalty program currency since FTs can be divided into smaller amounts, can be exchanged easily, and each token is of the same type with identical specification, and functionality with the same inherent value.\nThe NEAR blockchain manages your user accounts so you don’t have to. Simply send FT to an address associated with your user and use the Pagoda APIs to retrieve user data from on-chain.\nNEAR is scalable, and fast because of a technology we call sharding. All the cross-shard communication is built into the protocol so you can trust that balances are up-to-date and accurate. ",
      //     benefitsRich:
      //       "- FTs act similarly to loyalty program currency since FTs can be divided into smaller amounts, can be exchanged easily, and each token is of the same type with identical specification, and functionality with the same inherent value.\n- The NEAR blockchain manages your user accounts so you don’t have to. Simply send FT to an address associated with your user and use the Pagoda APIs to retrieve user data from on-chain.\n- NEAR is scalable, and fast because of a technology we call sharding. All the cross-shard communication is built into the protocol so you can trust that balances are up-to-date and accurate. ",
      //   },
      // });
    }
  },
};
