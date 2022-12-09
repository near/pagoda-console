import { ESLintUtils } from "@typescript-eslint/utils";
import * as requiredProperties from "./required-properties";

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
});

([requiredProperties] as const).forEach(({ rule, tests, name }) =>
  ruleTester.run(name, rule, tests)
);
