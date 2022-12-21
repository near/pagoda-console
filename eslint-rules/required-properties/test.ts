import { TSESLint } from "@typescript-eslint/utils";
import { MessageIdsOf, OptionsOf } from "../types";
import { rule, Option, Condition } from "./rule";

const literalCondition: Condition = "bar";
const orCondition: Condition = { type: "or", conditions: ["bar", "baz"] };
const andCondition: Condition = { type: "and", conditions: ["bar", "baz"] };

const message = "Additional message";

const getOption = (condition: Condition): Option => ({
  objectIdentifier: "foo",
  condition,
  message,
});

export const tests: TSESLint.RunTests<
  MessageIdsOf<typeof rule>,
  OptionsOf<typeof rule>
> = {
  valid: [
    {
      code: `
        const x = {
          foo: {
            bar: 1
          }
        }
      `,
      options: [getOption(literalCondition)],
    },
    {
      code: `
        const x = {
          foo: {
            bar: 1,
            baz: 2
          }
        }
      `,
      options: [getOption(literalCondition)],
    },
    {
      code: `
        const x = {
          foo: {
            bar: 1
          }
        }
      `,
      options: [getOption(orCondition)],
    },
    {
      code: `
        const x = {
          foo: {
            bar: 1,
            baz: 2,
          }
        }
      `,
      options: [getOption(andCondition)],
    },
  ],
  invalid: [
    {
      code: `
        const x = {
          foo: {
            empty: 1
          }
        }
      `,
      options: [getOption(literalCondition)],
      errors: [
        {
          messageId: "missingIdentifiers",
          data: { message, ids: '"bar"' },
        },
      ],
    },
    {
      code: `
        const x = {
          foo: {
            empty: 1
          }
        }
      `,
      options: [getOption(orCondition)],
      errors: [
        {
          messageId: "missingIdentifiers",
          data: { message, ids: '("bar" or "baz")' },
        },
      ],
    },
    {
      code: `
        const x = {
          foo: {
            bar: 1
          }
        }
      `,
      options: [getOption(andCondition)],
      errors: [
        {
          messageId: "missingIdentifiers",
          data: { message, ids: '"baz"' },
        },
      ],
    },
    {
      code: `
        const x = {
          foo: {
            baz: 1
          }
        }
      `,
      options: [getOption(andCondition)],
      errors: [
        {
          messageId: "missingIdentifiers",
          data: { message, ids: '"bar"' },
        },
      ],
    },
  ],
};
