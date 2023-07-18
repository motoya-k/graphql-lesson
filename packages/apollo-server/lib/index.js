"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@apollo/server");
const standalone_1 = require("@apollo/server/standalone");
const auth_1 = require("./directives/auth");
const schema_1 = require("@graphql-tools/schema");
const stitching_directives_1 = require("@graphql-tools/stitching-directives");
const books = [
    {
        title: "The Awakening",
        author: "Kate Chopin",
        email: "kate@example.com",
    },
    {
        title: "City of Glass",
        author: "Paul Auster",
        email: "paul@example.com",
    },
];
const { deprecatedDirectiveTypeDefs, deprecatedDirectiveTransformer } = (0, auth_1.deprecatedDirective)("myDeprecated");
const { allStitchingDirectivesTypeDefs, stitchingDirectivesValidator } = (0, stitching_directives_1.stitchingDirectives)();
// locations https://www.apollographql.com/docs/apollo-server/v3/schema/creating-directives/#supported-locations
const baseTypeDefs = `#graphql
  ${allStitchingDirectivesTypeDefs}
  type Book {
    title: String 
    author: String 
    email: String
  }

  type Query {
    books: [Book]
    ping2: String
    _sdl: String
  }
`;
const typeDefs = `${deprecatedDirectiveTypeDefs} ${baseTypeDefs}`;
const resolvers = {
    Query: {
        _sdl: () => typeDefs,
        books: () => books,
        ping2: () => "pong from apollo-server",
    },
};
let schema = stitchingDirectivesValidator((0, schema_1.makeExecutableSchema)({
    typeDefs,
    resolvers,
}));
schema = deprecatedDirectiveTransformer(schema);
async function server() {
    const server = new server_1.ApolloServer({
        schema,
    });
    const { url } = await (0, standalone_1.startStandaloneServer)(server, {
        listen: { port: 4001 },
    });
    console.log(`🚀  Server ready at: ${url}`);
}
server();
//# sourceMappingURL=index.js.map