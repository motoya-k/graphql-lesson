import { createYoga, createSchema } from "graphql-yoga";
import { createServer } from "http";
import { useDisableIntrospection } from "@graphql-yoga/plugin-disable-introspection";
import { stitchingDirectives } from "@graphql-tools/stitching-directives";
import { prisma } from "./client/prisma";

const { allStitchingDirectivesTypeDefs, stitchingDirectivesValidator } =
  stitchingDirectives();

const PORT = 4004;

export const message = {
  title: "Hello World",
  content: "This is a message",
  author: "yan",
};

const typeDefs = /* GraphQL */ `
  ${allStitchingDirectivesTypeDefs}
  type Query {
    ping: String!
    _sdl: String!
    events: [Event!]!
    event(id: ID!): Event!
    users: [User!]!
    user(id: ID!): User! @merge(keyField: "id")
    tickets: [Ticket!]!
    ticket(id: ID!): Ticket!
  }

  type Event {
    id: ID!
    title: String!
    date: String!
    location: String!
    users: [User!]!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    event: Event
    eventId: String!
    tickets: [Ticket!]!
  }

  type Ticket {
    id: ID!
    title: String!
    description: String!
    assignedToId: ID!
    assignedTo: User!
  }
`;

function main() {
  const schema = createSchema({
    typeDefs,
    resolvers: {
      Query: {
        ping() {
          return "pong";
        },
        events: async () => {
          return await prisma.event.findMany();
        },
        event: async (_, { id }) => {
          try {
            return await prisma.event.findUniqueOrThrow({
              where: {
                id,
              },
            });
          } catch {
            return null;
          }
        },
        users: async () => {
          return await prisma.user.findMany();
        },
        user: async (_, { id }) => {
          try {
            return await prisma.user.findUniqueOrThrow({
              where: {
                id,
              },
            });
          } catch {
            return null;
          }
        },
        tickets: async () => {
          return await prisma.ticket.findMany();
        },
        ticket: async (_, { id }) => {
          try {
            return await prisma.ticket.findUnique({
              where: {
                id,
              },
            });
          } catch {
            return null;
          }
        },
      },
      User: {
        event: async (parent) => {
          try {
            return await prisma.event.findUniqueOrThrow({
              where: {
                id: parent.eventId,
              },
            });
          } catch {
            return null;
          }
        },
        tickets: async (parent) => {
          return await prisma.ticket.findMany({
            where: {
              assignedToId: parent.id,
            },
          });
        },
      },
      Event: {
        users: async (parent) => {
          return await prisma.user.findMany({
            where: {
              eventId: parent.id,
            },
          });
        },
      },
      Ticket: {
        assignedTo: async (parent) => {
          try {
            return await prisma.user.findUniqueOrThrow({
              where: {
                id: parent.assignedToId,
              },
            });
          } catch (error) {
            return null;
          }
        },
      },
    },
  });
  /** NOTE: introspection を無効にする */
  const yoga = createYoga({ schema, plugins: [useDisableIntrospection()] });
  const server = createServer(yoga);
  server.listen(PORT, () => {
    console.info(`Server is running on http://localhost:${PORT}/graphql`);
  });

  const gatewaySchema = createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        _sdl: String!
        ping: String!
      }
    `,
    resolvers: {
      Query: {
        ping() {
          return "pong from sdl endpoint";
        },
        _sdl() {
          return typeDefs;
        },
      },
    },
  });
  const yogaForGateway = createYoga({
    schema: stitchingDirectivesValidator(gatewaySchema),
  });
  const internalServer = createServer(yogaForGateway);
  internalServer.listen(4404, () => {
    console.info(
      `Internal Server for Gateway is running on http://localhost:${4405}/graphql`
    );
  });
}

main();
