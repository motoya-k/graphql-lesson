import { createYoga, createSchema } from "graphql-yoga";
import { createServer } from "http";
import { useDisableIntrospection } from "@graphql-yoga/plugin-disable-introspection";
import { stitchingDirectives } from "@graphql-tools/stitching-directives";
import { prisma } from "./client/prisma";

const { allStitchingDirectivesTypeDefs, stitchingDirectivesValidator } =
  stitchingDirectives();

const PORT = 4014;

const typeDefs = /* GraphQL */ `
  ${allStitchingDirectivesTypeDefs}
  type Query {
    ping: String!
    _sdl: String!
    users: [User!]!
    getPostUser(id: ID!): User! @merge(keyField: "id")
    posts: [Post!]!
    post(variables: PostInput!): Post!
    likes: [Like!]!
    like(id: ID!): Like!
  }

  type User {
    id: ID!
    name: String!
    bio: String
    location: String
    likes: [Like!]!
    posts: [Post!]!
  }

  input PostInput {
    id: ID!
    weight: Int!
  }
  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    authorId: ID!
    likes: [Like!]!
    estimatedLikes: Int
  }

  type Like {
    id: ID!
    user: User!
    userId: ID!
    post: Post!
    postId: ID!
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
        users: async () => {
          return await prisma.user.findMany();
        },
        getPostUser: async (_, { id }) => {
          return await prisma.user.findUnique({ where: { id } });
        },
        posts: async () => {
          return await prisma.post.findMany();
        },
        post: async (_, { variables: { id, weight } }) => {
          const post = await prisma.post.findUnique({ where: { id } });
          const results = {
            ...post,
            weight,
          };
          return results;
        },
        likes: async () => {
          return await prisma.like.findMany();
        },
        like: async (_, { id }) => {
          return await prisma.like.findUnique({ where: { id } });
        },
      },
      User: {
        name: async (parent) => {
          return `${parent.name} (from yoga2)`;
        },
        likes: async (parent) => {
          return await prisma.like.findMany({ where: { userId: parent.id } });
        },
        posts: async (parent) => {
          return await prisma.post.findMany({ where: { authorId: parent.id } });
        },
      },
      Post: {
        likes: async (parent) => {
          return await prisma.like.findMany({ where: { postId: parent.id } });
        },
        author: async (parent) => {
          return await prisma.user.findUnique({ where: { id: parent.authorId } });
        },
        estimatedLikes: async (parent) => {
          return parent.weight ? parent.weight * 100 : null;
        },
      },
      Like: {
        user: async (parent) => {
          return await prisma.user.findUnique({ where: { id: parent.userId } });
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
  internalServer.listen(4414, () => {
    console.info(
      `Internal Server for Gateway is running on http://localhost:${4414}/graphql`
    );
  });
}

main();
