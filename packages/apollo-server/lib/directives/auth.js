"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deprecatedDirective = void 0;
const utils_1 = require("@graphql-tools/utils");
function deprecatedDirective(directiveName) {
    return {
        deprecatedDirectiveTypeDefs: `directive @${directiveName}(reason: String) on FIELD_DEFINITION | ENUM_VALUE | QUERY | FIELD`,
        deprecatedDirectiveTransformer: (schema) => (0, utils_1.mapSchema)(schema, {
            [utils_1.MapperKind.OBJECT_FIELD](objectFieldConfig) {
                const directives = (0, utils_1.getDirective)(schema, objectFieldConfig, directiveName);
                const deprecatedDirective = directives?.[0];
                if (deprecatedDirective) {
                    objectFieldConfig.deprecationReason = "test";
                    objectFieldConfig.resolve = async () => {
                        return "pong from apollo-server (overwritten)";
                    };
                }
                return objectFieldConfig;
            },
            [utils_1.MapperKind.ENUM_VALUE](enumValueConfig) {
                const deprecatedDirective = (0, utils_1.getDirective)(schema, enumValueConfig, directiveName)?.[0];
                if (deprecatedDirective) {
                    enumValueConfig.deprecationReason = deprecatedDirective["reason"];
                    return enumValueConfig;
                }
            },
            [utils_1.MapperKind.FIELD](fieldConfig) {
                const deprecatedDirective = (0, utils_1.getDirective)(schema, fieldConfig, directiveName)?.[0];
                if (deprecatedDirective) {
                    fieldConfig.deprecationReason = deprecatedDirective["reason"];
                    return fieldConfig;
                }
            },
            [utils_1.MapperKind.QUERY](queryConfig) {
                console.log("run QUERY");
                const deprecatedDirective = (0, utils_1.getDirective)(schema, queryConfig, directiveName)?.[0];
                console.log("queryConfig.getFields()", queryConfig.getFields());
                if (queryConfig.getFields()[0]) {
                    queryConfig.getFields()[0].resolve = async () => {
                        return "pong from apollo-server (overwritten)";
                    };
                }
                // なぜここで呼ばれないのか ?
                if (deprecatedDirective) {
                }
                return queryConfig;
            },
        }),
    };
}
exports.deprecatedDirective = deprecatedDirective;
//# sourceMappingURL=auth.js.map