import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import { prisma } from "./client/prisma";

// Construct a schema, using GraphQL schema language
const typeDef = `
  type User {
    name: String!
    email: String!
    eventId: String
  }
  type Post {
    id: String!
    title: String!
    content: String!
    authorId: String!
    author: User!
  }
  type Like {
    id: String!
    userId: String!
    user: User!
    postId: String!
    post: Post!
  }
  type Query {
    ping: String!
    _sdl: String!
    users: [User]!
    posts: [Post]!
    likes: [Like]!
  }
`;
var schema = buildSchema(typeDef);

// The root provides a resolver function for each API endpoint
var root = {
  ping: () => {
    return "pong from express-graphql";
  },
  _sdl: () => {
    return typeDef;
  },
  users: async () => {
    const users = await prisma.user.findMany();
    return users;
  },
  posts: async () => {
    const posts = await prisma.post.findMany({
      include: {
        author: true,
      },
    });
    return posts;
  },
  likes: async () => {
    console.log("call likes");
    const likes = await prisma.like.findMany({
      include: {
        user: true,
        post: true,
      },
    });
    return likes;
  },
  Like: {
    user: async (parent) => {
      console.log("parent", parent);
      const user = await prisma.user.findUnique({
        where: {
          id: parent.userId,
        },
      });
      return user;
    },
    post: async (parent) => {
      const post = await prisma.post.findUnique({
        where: {
          id: parent.postId,
        },
      });
      return post;
    },
  },
  Post: {
    author: async (parent) => {
      const user = await prisma.user.findUnique({
        where: {
          id: parent.authorId,
        },
      });
      return user;
    },
  },
};

/** CAUTION: もしかしたらこの辺の実装は express-graphql にはないのかもしれない */
// const typeResolver = {
//   Like: {
//     user: async (parent) => {
//       const user = await prisma.user.findUnique({
//         where: {
//           id: parent.userId,
//         },
//       });
//       return user;
//     },
//     post: async (parent) => {
//       const post = await prisma.post.findUnique({
//         where: {
//           id: parent.postId,
//         },
//       });
//       return post;
//     },
//   },
//   Post: {
//     author: async (parent) => {
//       const user = await prisma.user.findUnique({
//         where: {
//           id: parent.authorId,
//         },
//       });
//       return user;
//     },
//   },
// };

async function server() {
  var app = express();
  app.use(
    "/graphql",
    graphqlHTTP({
      schema: schema,
      rootValue: root,
      graphiql: true,
    })
  );
  const PORT = 4002;
  app.listen(PORT);
  console.log(
    `Running a GraphQL API server at http://localhost:${PORT}/graphql`
  );
}

server();
