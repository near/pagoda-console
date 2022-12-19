export declare const name = "require-properties-in-object";
declare type OrCondition = {
    type: "or";
    conditions: Condition[];
};
declare type AndCondition = {
    type: "and";
    conditions: Condition[];
};
export declare type Condition = OrCondition | AndCondition | string;
export declare type Option = {
    objectIdentifier: string;
    condition: Condition;
    message?: string;
};
export declare const rule: import("@typescript-eslint/utils/dist/ts-eslint/Rule").RuleModule<"missingIdentifiers", Option[], import("@typescript-eslint/utils/dist/ts-eslint/Rule").RuleListener>;
export {};
