import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { deprecatedDirective } from "./directives/auth";
import { makeExecutableSchema } from "@graphql-tools/schema";
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

const { deprecatedDirectiveTypeDefs, deprecatedDirectiveTransformer } =
  deprecatedDirective("myDeprecated");

const baseTypeDefs = `#graphql
  # locations https://www.apollographql.com/docs/apollo-server/v3/schema/creating-directives/#supported-locations
  type Book {
    title: String 
    author: String 
    email: String @myDeprecated(reason: "test")
  }

  type Query {
    books: [Book]
    ping2: String
  }
`;

const resolvers = {
  Query: {
    books: () => books,
    ping2: () => "pong from apollo-server",
  },
};
let schema = makeExecutableSchema({
  typeDefs: [deprecatedDirectiveTypeDefs, baseTypeDefs],
  resolvers,
});
schema = deprecatedDirectiveTransformer(schema);

async function server() {
  const server = new ApolloServer({
    schema,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4001 },
  });

  console.log(`🚀  Server ready at: ${url}`);
}

server();
