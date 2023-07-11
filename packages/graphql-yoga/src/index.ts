import { createYoga, createSchema } from "graphql-yoga";
import { createServer } from "http";

const PORT = 4004;

export const message = {
  title: "Hello World",
  content: "This is a message",
  author: "yan",
};

function main() {
  const schema = createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        ping: String!
        messages: [Message!]
      }

      type Mutation {
        createMessage(
          title: String!
          content: String!
          author: String!
        ): Message
      }

      type Message {
        _id: ID!
        title: String!
        content: String!
        author: String!
      }
    `,
    resolvers: {
      Query: {
        ping() {
          return "pong";
        },
        messages: async () => {
          return [message];
        },
      },
      Mutation: {
        createMessage: async (_, { title, content, author }) => {
          return message;
        },
      },
    },
  });
  const yoga = createYoga({ schema });
  const server = createServer(yoga);
  server.listen(PORT, () => {
    console.info(`Server is running on http://localhost:${PORT}/graphql`);
  });
}

main();
