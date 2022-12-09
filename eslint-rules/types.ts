import { TSESLint } from "@typescript-eslint/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type MessageIdsOf<T extends TSESLint.RuleModule<any, any, any>> =
  T extends TSESLint.RuleModule<infer M, any, any> ? M : never;
export type OptionsOf<T extends TSESLint.RuleModule<any, any, any>> =
  T extends TSESLint.RuleModule<any, infer O, any> ? O : never;
/* eslint-enable @typescript-eslint/no-explicit-any */
