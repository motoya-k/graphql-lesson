"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@apollo/server");
const standalone_1 = require("@apollo/server/standalone");
const typeDefs = `#graphql
  type Book {
    title: String
    author: String
    email: String @deprecated(reason: "Use \`author\` instead")
  }

  type Query {
    books: [Book]
    ping2: String
  }
`;
const books = [
    {
        title: "The Awakening",
        author: "Kate Chopin",
        email: "kate@example.com"
    },
    {
        title: "City of Glass",
        author: "Paul Auster",
        email: "paul@example.com"
    },
];
const resolvers = {
    Query: {
        books: () => books,
        ping2: () => "pong from apollo-server",
    },
};
const server = new server_1.ApolloServer({
    typeDefs,
    resolvers,
});
const { url } = await (0, standalone_1.startStandaloneServer)(server, {
    listen: { port: 4001 },
});
console.log(`🚀  Server ready at: ${url}`);
//# sourceMappingURL=index.js.map