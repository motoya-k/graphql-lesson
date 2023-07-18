import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { deprecatedDirective } from "./directives/auth";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { stitchingDirectives } from "@graphql-tools/stitching-directives";
import { prisma } from "./client.ts/prisma";

const authors = [
  {
    name: "Kate Chopin",
    email: "kate@example.com",
  },
  {
    name: "Paul Auster",
    email: "paul@example.com",
  },
];
const books = [
  {
    title: "The Awakening",
    // author: authors[0],
    email: "kate@example.com",
  },
  {
    title: "City of Glass",
    author: authors[0],
    email: "paul@example.com",
  },
];

const { deprecatedDirectiveTypeDefs, deprecatedDirectiveTransformer } =
  deprecatedDirective("myDeprecated");
const { allStitchingDirectivesTypeDefs, stitchingDirectivesValidator } =
  stitchingDirectives();

// locations https://www.apollographql.com/docs/apollo-server/v3/schema/creating-directives/#supported-locations
const baseTypeDefs = `#graphql
  ${allStitchingDirectivesTypeDefs}

  type User {
    name: String!
    email: String!
    eventId: String
    event: Event
  }

  type Event {
    id: String!
    title: String!
    date: String!
    location: String!
    users: [User]!
  }

  type Query {
    # internal
    ping: String
    _sdl: String
    # external
    users: [User]!
    events: [Event]!
  }
`;
const typeDefs = `${deprecatedDirectiveTypeDefs} ${baseTypeDefs}`;

const resolvers = {
  Query: {
    ping: () => "pong from apollo-server",
    _sdl: () => typeDefs,
    users: async () => {
      const users = await prisma.user.findMany();
      return users;
    },
    events: async () => {
      const events = await prisma.event.findMany();
      return events;
    },
  },
  User: {
    event: async (parent) => {
      if (!parent.eventId) return null;
      const event = await prisma.event.findUnique({
        where: {
          id: parent.eventId,
        },
      });
      return event;
    },
  },
  Event: {
    users: async (parent) => {
      const users = await prisma.user.findMany({
        where: {
          eventId: parent.id,
        },
      });
      return users;
    },
  },
};

let schema = stitchingDirectivesValidator(
  makeExecutableSchema({
    typeDefs,
    resolvers,
  })
);
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
