import { TSESLint } from "@typescript-eslint/utils";
export declare type MessageIdsOf<T extends TSESLint.RuleModule<any, any, any>> = T extends TSESLint.RuleModule<infer M, any, any> ? M : never;
export declare type OptionsOf<T extends TSESLint.RuleModule<any, any, any>> = T extends TSESLint.RuleModule<any, infer O, any> ? O : never;
