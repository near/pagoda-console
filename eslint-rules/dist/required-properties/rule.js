"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = exports.name = void 0;
const utils_1 = require("@typescript-eslint/utils");
const createRule = utils_1.ESLintUtils.RuleCreator(() => "No description");
exports.name = "require-properties-in-object";
const getMissingIdentifier = (ids, condition) => {
    if (typeof condition === "string") {
        if (ids.includes(condition)) {
            return;
        }
        return `"${condition}"`;
    }
    const missingIdentifiers = condition.conditions
        .map((subcondition) => getMissingIdentifier(ids, subcondition))
        .filter(Boolean);
    if (missingIdentifiers.length === 0) {
        return;
    }
    if (condition.type === "or" &&
        missingIdentifiers.length !== condition.conditions.length) {
        return;
    }
    if (missingIdentifiers.length === 1) {
        return missingIdentifiers[0];
    }
    return `(${missingIdentifiers.join(` ${condition.type} `)})`;
};
exports.rule = createRule({
    create: (context) => ({
        Property: (property) => {
            const matchedOption = context.options.find((option) => {
                if (property.key.type !== utils_1.AST_NODE_TYPES.Identifier) {
                    return;
                }
                return property.key.name === option.objectIdentifier;
            });
            if (!matchedOption) {
                return;
            }
            if (property.value.type !== utils_1.AST_NODE_TYPES.ObjectExpression) {
                return;
            }
            const propertiesIdentifiers = property.value.properties.map((property) => {
                if (property.type !== utils_1.AST_NODE_TYPES.Property) {
                    return;
                }
                if (property.key.type !== utils_1.AST_NODE_TYPES.Identifier) {
                    return;
                }
                return property.key.name;
            });
            const missingIdentifier = getMissingIdentifier(propertiesIdentifiers, matchedOption.condition);
            if (missingIdentifier) {
                context.report({
                    messageId: "missingIdentifiers",
                    data: {
                        ids: missingIdentifier,
                        message: matchedOption.message,
                    },
                    node: property.value,
                });
            }
        },
    }),
    name: exports.name,
    meta: {
        docs: {
            description: "Properties required in an object declaration.",
            recommended: "warn",
        },
        messages: {
            missingIdentifiers: "Property(s) {{ids}} expected. {{message}}",
        },
        type: "suggestion",
        schema: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    objectIdentifier: { type: "string" },
                    condition: {
                        $ref: "#/$defs/condition",
                    },
                    message: { type: "string" },
                },
                required: ["objectIdentifier", "condition"],
                additionalProperties: false,
            },
            uniqueItems: true,
            minItems: 0,
            $defs: {
                orCondition: {
                    type: "object",
                    properties: {
                        type: {
                            type: "string",
                            const: "or",
                        },
                        conditions: {
                            type: "array",
                            items: {
                                $ref: "#/$defs/condition",
                            },
                        },
                    },
                    required: ["type", "conditions"],
                    additionalProperties: false,
                },
                andCondition: {
                    type: "object",
                    properties: {
                        type: {
                            type: "string",
                            const: "and",
                        },
                        conditions: {
                            type: "array",
                            items: {
                                $ref: "#/$defs/condition",
                            },
                        },
                    },
                    required: ["type", "conditions"],
                    additionalProperties: false,
                },
                condition: {
                    anyOf: [
                        { $ref: "#/$defs/orCondition" },
                        { $ref: "#/$defs/andCondition" },
                        { type: "string" },
                    ],
                },
            },
        },
    },
    defaultOptions: [],
});
//# sourceMappingURL=rule.js.map