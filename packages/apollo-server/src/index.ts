import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

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
    email: "kate@example.com",
  },
  {
    title: "City of Glass",
    author: "Paul Auster",
    email: "paul@example.com",
  },
];

const resolvers = {
  Query: {
    books: () => books,
    ping2: () => "pong from apollo-server",
  },
};

async function server() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4001 },
  });

  console.log(`🚀  Server ready at: ${url}`);
}

server();
