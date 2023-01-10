"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tests = void 0;
const literalCondition = "bar";
const orCondition = { type: "or", conditions: ["bar", "baz"] };
const andCondition = { type: "and", conditions: ["bar", "baz"] };
const message = "Additional message";
const getOption = (condition) => ({
    objectIdentifier: "foo",
    condition,
    message,
});
exports.tests = {
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
//# sourceMappingURL=test.js.map