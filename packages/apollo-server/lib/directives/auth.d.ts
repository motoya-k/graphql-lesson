import { GraphQLSchema } from "graphql";
export declare function deprecatedDirective(directiveName: string): {
    deprecatedDirectiveTypeDefs: string;
    deprecatedDirectiveTransformer: (schema: GraphQLSchema) => GraphQLSchema;
};
