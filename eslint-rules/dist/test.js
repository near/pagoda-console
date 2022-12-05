"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const requiredProperties = require("./required-properties");
const ruleTester = new utils_1.ESLintUtils.RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "tsconfig.json",
        tsconfigRootDir: __dirname,
    },
});
[requiredProperties].forEach(({ rule, tests, name }) => ruleTester.run(name, rule, tests));
//# sourceMappingURL=test.js.map