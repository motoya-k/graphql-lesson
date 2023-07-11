import { makeExecutableSchema } from "@graphql-tools/schema";
import { stitchSchemas } from "@graphql-tools/stitch";

let postsSchema = makeExecutableSchema({
  typeDefs: /* GraphQL */ `
    type Post {
      id: ID!
      text: String
      userId: ID!
    }

    type Query {
      postById(id: ID!): Post
      postsByUserId(userId: ID!): [Post]!
    }
  `,
  resolvers: {
    // ...
  },
});

let usersSchema = makeExecutableSchema({
  typeDefs: /* GraphQL */ `
    type User {
      id: ID!
      email: String
    }

    type Query {
      userById(id: ID!): User
    }
  `,
  resolvers: {
    // ...
  },
});

// setup subschema configurations
export const postsSubschema = { schema: postsSchema };
export const usersSubschema = { schema: usersSchema };

export const createGatewaySchema = async () => {
  // build the combined schema
  return stitchSchemas({
    subschemas: [postsSubschema, usersSubschema],
  });
};
