import { TSESLint } from "@typescript-eslint/utils";
import { MessageIdsOf, OptionsOf } from "../types";
import { rule } from "./rule";
export declare const tests: TSESLint.RunTests<MessageIdsOf<typeof rule>, OptionsOf<typeof rule>>;
